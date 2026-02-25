// PsikoTakip — Service Worker for Background Notifications
// Bu SW uygulama kapalı olsa bile arka planda seans kontrolü yapar.

const REMINDER_MINUTES = 15;
const CHECK_INTERVAL_MS = 60 * 1000; // Her 60 saniyede bir kontrol
let config = null;     // { supabaseUrl, supabaseKey, userId, lang }
let notifiedIds = {};  // Zaten bildirim gönderilmiş seanslar
let checkTimer = null;

// =================== INSTALL ===================
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

// =================== ACTIVATE ===================
self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
    // Activate olunca kayıtlı config varsa yükle
    loadConfig();
});

// =================== CONFIG PERSISTENCE (IndexedDB-lite via Cache API) ===================
async function saveConfig(cfg) {
    try {
        const cache = await caches.open('psikotakip-notif');
        const response = new Response(JSON.stringify(cfg));
        await cache.put('/notif-config', response);
    } catch (e) {
        console.log('[SW] Config kaydetme hatası:', e);
    }
}

async function loadConfig() {
    try {
        const cache = await caches.open('psikotakip-notif');
        const response = await cache.match('/notif-config');
        if (response) {
            config = await response.json();
            console.log('[SW] Config yüklendi:', config?.userId ? '✅' : '❌');
            startBackgroundCheck();
        }
    } catch (e) {
        console.log('[SW] Config yükleme hatası:', e);
    }
}

// =================== MESSAGE HANDLER ===================
self.addEventListener('message', (event) => {
    const data = event.data;
    if (!data) return;

    switch (data.type) {
        case 'SET_CONFIG':
            // Uygulama config bilgilerini gönderir
            config = {
                supabaseUrl: data.supabaseUrl,
                supabaseKey: data.supabaseKey,
                userId: data.userId,
                lang: data.lang || 'tr',
            };
            saveConfig(config);
            console.log('[SW] Config alındı, userId:', config.userId);
            startBackgroundCheck();
            break;

        case 'SHOW_NOTIFICATION':
            // Uygulama açıkken doğrudan bildirim göster
            showNotif(data.title, data.body, data.tag);
            break;

        case 'CLEAR_CONFIG':
            // Logout olunca temizle
            config = null;
            if (checkTimer) { clearInterval(checkTimer); checkTimer = null; }
            caches.delete('psikotakip-notif');
            break;
    }
});

// =================== NOTIFICATION DISPLAY ===================
function showNotif(title, body, tag) {
    return self.registration.showNotification(title, {
        body,
        tag: tag || 'psikotakip-' + Date.now(),
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
            { action: 'open', title: '📅 Aç' },
            { action: 'dismiss', title: '✖ Kapat' },
        ],
    });
}

// =================== BACKGROUND CHECK ===================
function startBackgroundCheck() {
    if (checkTimer) clearInterval(checkTimer);
    if (!config || !config.userId) return;

    console.log('[SW] Arka plan kontrolü başlatıldı ⏰');

    // İlk kontrol hemen
    checkAndNotify();

    // Periyodik kontrol
    checkTimer = setInterval(checkAndNotify, CHECK_INTERVAL_MS);
}

async function checkAndNotify() {
    if (!config || !config.supabaseUrl || !config.userId) return;

    try {
        // Supabase REST API ile bugünden itibaren planlanmış seansları çek
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString();

        const url = `${config.supabaseUrl}/rest/v1/sessions?user_id=eq.${config.userId}&status=eq.scheduled&date=gte.${todayStart}&date=lt.${tomorrowEnd}&select=id,date,client_id,session_type`;

        const response = await fetch(url, {
            headers: {
                'apikey': config.supabaseKey,
                'Authorization': `Bearer ${config.supabaseKey}`,
            },
        });

        if (!response.ok) {
            console.log('[SW] Supabase fetch hatası:', response.status);
            return;
        }

        const sessions = await response.json();

        // Danışan isimlerini çek (varsa)
        const clientIds = [...new Set(sessions.map(s => s.client_id).filter(Boolean))];
        let clientMap = {};
        if (clientIds.length > 0) {
            const clientUrl = `${config.supabaseUrl}/rest/v1/clients?id=in.(${clientIds.join(',')})&select=id,first_name,last_name`;
            const clientRes = await fetch(clientUrl, {
                headers: {
                    'apikey': config.supabaseKey,
                    'Authorization': `Bearer ${config.supabaseKey}`,
                },
            });
            if (clientRes.ok) {
                const clients = await clientRes.json();
                clients.forEach(c => {
                    clientMap[c.id] = `${c.first_name} ${c.last_name}`;
                });
            }
        }

        // Her seans için bildirim kontrolü
        sessions.forEach((session) => {
            const sessionDate = new Date(session.date);
            const diffMs = sessionDate.getTime() - now.getTime();
            const diffMinutes = diffMs / (1000 * 60);

            if (diffMinutes > 0 && diffMinutes <= REMINDER_MINUTES) {
                const alertId = `${session.id}_bg`;

                if (!notifiedIds[alertId]) {
                    notifiedIds[alertId] = true;

                    const clientName = clientMap[session.client_id] || 'Danışan';
                    const minutesLeft = Math.ceil(diffMinutes);

                    const isTR = config.lang === 'tr';
                    const title = isTR ? '🔔 Randevu Hatırlatması' : '� Appointment Reminder';
                    const body = isTR
                        ? `${minutesLeft} dakika sonra ${clientName} ile görüşmeniz var!`
                        : `You have a session with ${clientName} in ${minutesLeft} minutes!`;

                    console.log(`[SW] 📤 Bildirim: ${clientName} — ${minutesLeft} dk`);
                    showNotif(title, body, alertId);
                }
            }
        });

        // Eski notifiedIds temizle (24 saatten eski)
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        Object.keys(notifiedIds).forEach(key => {
            if (notifiedIds[key] === true) notifiedIds[key] = Date.now();
            if (notifiedIds[key] < cutoff) delete notifiedIds[key];
        });

    } catch (err) {
        console.log('[SW] Arka plan kontrol hatası:', err);
    }
}

// =================== PERIODIC SYNC (modern browsers) ===================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-appointments') {
        event.waitUntil(checkAndNotify());
    }
});

// =================== NOTIFICATION CLICK ===================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('/');
            }
        })
    );
});
