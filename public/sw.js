// PsikoTakip — Service Worker for Background Notifications
// Bu SW uygulama kapalı/arka planda olsa bile bildirim gönderir.

const REMINDER_MINUTES = 15;
const CHECK_INTERVAL_MS = 55 * 1000; // 55 saniye (tarayıcı SW'yi 60sn sonra uyutabilir)
const NOTIFIED_CACHE_KEY = 'psikotakip-notified';
const CONFIG_CACHE_KEY = 'psikotakip-notif';

let config = null;
let scheduledTimers = {};

// =================== INSTALL ===================
self.addEventListener('install', () => {
    console.log('[SW] ✅ Yüklendi');
    self.skipWaiting();
});

// =================== ACTIVATE ===================
self.addEventListener('activate', (event) => {
    console.log('[SW] ✅ Aktif');
    event.waitUntil(
        self.clients.claim().then(() => loadConfigAndStart())
    );
});

// =================== CONFIG PERSISTENCE (Cache API) ===================
async function saveConfig(cfg) {
    try {
        const cache = await caches.open(CONFIG_CACHE_KEY);
        await cache.put('/notif-config', new Response(JSON.stringify(cfg)));
    } catch (e) {
        console.log('[SW] Config kaydetme hatası:', e);
    }
}

async function loadConfigAndStart() {
    try {
        const cache = await caches.open(CONFIG_CACHE_KEY);
        const response = await cache.match('/notif-config');
        if (response) {
            config = await response.json();
            console.log('[SW] Config yüklendi:', config?.userId ? '✅' : '❌');
            if (config?.userId) {
                checkAndSchedule();
            }
        }
    } catch (e) {
        console.log('[SW] Config yükleme hatası:', e);
    }
}

// =================== NOTIFIED IDS PERSISTENCE ===================
async function getNotifiedIds() {
    try {
        const cache = await caches.open(NOTIFIED_CACHE_KEY);
        const response = await cache.match('/notified');
        if (response) {
            const data = await response.json();
            const cutoff = Date.now() - 24 * 60 * 60 * 1000;
            const cleaned = {};
            Object.entries(data).forEach(([key, timestamp]) => {
                if (timestamp > cutoff) cleaned[key] = timestamp;
            });
            return cleaned;
        }
    } catch (e) { /* */ }
    return {};
}

async function markNotified(alertId) {
    try {
        const ids = await getNotifiedIds();
        ids[alertId] = Date.now();
        const cache = await caches.open(NOTIFIED_CACHE_KEY);
        await cache.put('/notified', new Response(JSON.stringify(ids)));
    } catch (e) { /* */ }
}

// =================== MESSAGE HANDLER ===================
self.addEventListener('message', (event) => {
    const data = event.data;
    if (!data) return;

    switch (data.type) {
        case 'SET_CONFIG':
            config = {
                supabaseUrl: data.supabaseUrl,
                supabaseKey: data.supabaseKey,
                userId: data.userId,
                lang: data.lang || 'tr',
            };
            saveConfig(config);
            console.log('[SW] Config alındı, userId:', config.userId);
            checkAndSchedule();
            break;

        case 'SHOW_NOTIFICATION':
            showNotif(data.title, data.body, data.tag);
            break;

        case 'CLEAR_CONFIG':
            config = null;
            Object.values(scheduledTimers).forEach(t => clearTimeout(t));
            scheduledTimers = {};
            if (nextCheckTimer) { clearTimeout(nextCheckTimer); nextCheckTimer = null; }
            caches.delete(CONFIG_CACHE_KEY);
            caches.delete(NOTIFIED_CACHE_KEY);
            console.log('[SW] Config temizlendi');
            break;

        case 'HEARTBEAT':
            // Uygulama açıkken periyodik olarak SW'yi canlı tutar
            if (config?.userId) checkAndSchedule();
            break;
    }
});

// =================== NOTIFICATION DISPLAY ===================
function showNotif(title, body, tag) {
    console.log('[SW] 🔔 Bildirim gösteriliyor:', title);
    return self.registration.showNotification(title, {
        body,
        tag: tag || 'psikotakip-' + Date.now(),
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        renotify: true,
        actions: [
            { action: 'open', title: '📅 Aç' },
            { action: 'dismiss', title: '✖ Kapat' },
        ],
    });
}

// =================== CORE: CHECK & SCHEDULE ===================
async function checkAndSchedule() {
    if (!config?.supabaseUrl || !config?.userId) return;

    try {
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
            scheduleNextCheck();
            return;
        }

        const sessions = await response.json();
        console.log(`[SW] ${sessions.length} seans bulundu`);

        // Danışan isimlerini çek
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

        const notifiedIds = await getNotifiedIds();

        for (const session of sessions) {
            const sessionDate = new Date(session.date);
            const alertId = `${session.id}_bg`;
            const reminderTime = sessionDate.getTime() - REMINDER_MINUTES * 60 * 1000;
            const msUntilReminder = reminderTime - now.getTime();

            // Zaten bildirilmiş mi?
            if (notifiedIds[alertId]) continue;

            // Seans geçmişte mi?
            if (sessionDate.getTime() <= now.getTime()) continue;

            const clientName = clientMap[session.client_id] || 'Danışan';
            const isTR = config.lang === 'tr';
            const title = isTR ? '🔔 Randevu Hatırlatması' : '🔔 Appointment Reminder';

            if (msUntilReminder <= 0) {
                // Bildirim zamanı gelmiş ama seans henüz başlamamış — hemen gönder
                const minutesLeft = Math.max(1, Math.ceil((sessionDate.getTime() - now.getTime()) / (1000 * 60)));
                const body = isTR
                    ? `${minutesLeft} dakika sonra ${clientName} ile görüşmeniz var!`
                    : `You have a session with ${clientName} in ${minutesLeft} minutes!`;
                console.log(`[SW] 📤 Hemen bildirim: ${clientName} — ${minutesLeft} dk`);
                await showNotif(title, body, alertId);
                await markNotified(alertId);
            } else if (msUntilReminder > 0 && msUntilReminder <= CHECK_INTERVAL_MS * 2) {
                // Yaklaşan seans — setTimeout ile tam zamanında bildirim planla
                if (!scheduledTimers[alertId]) {
                    console.log(`[SW] ⏰ Planlandı: ${clientName} — ${Math.round(msUntilReminder / 1000)}sn sonra`);
                    scheduledTimers[alertId] = setTimeout(async () => {
                        const recheck = await getNotifiedIds();
                        if (!recheck[alertId]) {
                            const actualMinutes = Math.max(1, Math.ceil((sessionDate.getTime() - Date.now()) / (1000 * 60)));
                            const body = isTR
                                ? `${actualMinutes} dakika sonra ${clientName} ile görüşmeniz var!`
                                : `You have a session with ${clientName} in ${actualMinutes} minutes!`;
                            await showNotif(title, body, alertId);
                            await markNotified(alertId);
                        }
                        delete scheduledTimers[alertId];
                    }, msUntilReminder);
                }
            }
            // Daha uzak gelecek → sonraki check döngüsünde yakalanır
        }
    } catch (err) {
        console.log('[SW] Kontrol hatası:', err);
    }

    scheduleNextCheck();
}

// Recursive setTimeout (setInterval'den daha güvenilir)
let nextCheckTimer = null;
function scheduleNextCheck() {
    if (nextCheckTimer) clearTimeout(nextCheckTimer);
    nextCheckTimer = setTimeout(() => {
        if (config?.userId) checkAndSchedule();
    }, CHECK_INTERVAL_MS);
}

// =================== PUSH EVENT (Web Push API - gelecek için hazır) ===================
self.addEventListener('push', (event) => {
    console.log('[SW] Push alındı');
    let data = { title: '🔔 PsikoTakip', body: 'Yeni bildirim' };
    try {
        if (event.data) data = event.data.json();
    } catch (e) { /* */ }
    event.waitUntil(
        showNotif(data.title, data.body, data.tag || 'push-' + Date.now())
    );
});

// =================== PERIODIC SYNC ===================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-appointments') {
        console.log('[SW] Periodic sync tetiklendi');
        event.waitUntil(checkAndSchedule());
    }
});

// =================== FETCH EVENT ===================
self.addEventListener('fetch', (event) => {
    // keep-alive endpoint — SW'yi canlı tutar
    if (event.request.url.includes('/api/keep-alive')) {
        event.respondWith(new Response('ok', { status: 200 }));
        return;
    }
    // Diğer istekleri network'e ilet (cache stratejisi yok)
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
