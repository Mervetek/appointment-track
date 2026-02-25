import { useState, useEffect, useCallback, useRef } from 'react';

// ============ Bildirim izin durumu ============
const getPermissionStatus = () => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
};

// ============ Service Worker kaydı ============
const registerSW = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            return reg;
        } catch (err) {
            console.error('SW registration failed:', err);
            return null;
        }
    }
    return null;
};

// SW'ye config gönder (Supabase URL/Key/userId)
const sendConfigToSW = (reg, lang) => {
    if (!reg || !reg.active) return;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const userId = JSON.parse(localStorage.getItem('psikotakip_user') || '{}')?.id;
    if (!supabaseUrl || !supabaseKey || !userId) return;

    reg.active.postMessage({
        type: 'SET_CONFIG',
        supabaseUrl,
        supabaseKey,
        userId,
        lang: lang || 'tr',
    });
    console.log('[Notification] SW config gönderildi ✅');

    // Periodic Sync kaydı (destekleyen tarayıcılarda)
    if ('periodicSync' in reg) {
        reg.periodicSync.register('check-appointments', {
            minInterval: 60 * 1000, // 1 dakika minimum
        }).catch(() => { /* Desteklenmiyorsa sessizce geç */ });
    }
};

// ============ Hook ============
const REMINDER_MINUTES = 15;
const CHECK_INTERVAL_MS = 30 * 1000;

export const useNotifications = (sessions = [], getClientById, t, lang) => {
    const [permission, setPermission] = useState(getPermissionStatus);
    const [upcomingAlerts, setUpcomingAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifiedIds = useRef(new Set());
    const swReg = useRef(null);
    const alertsRef = useRef([]);

    useEffect(() => {
        alertsRef.current = upcomingAlerts;
    }, [upcomingAlerts]);

    // SW kayıt + config gönder
    useEffect(() => {
        registerSW().then((reg) => {
            swReg.current = reg;
            console.log('[Notification] Service Worker:', reg ? 'kayıtlı ✅' : 'kayıt başarısız ❌');
            // SW hazır olunca config gönder
            if (reg) {
                // SW active olana kadar bekle
                if (reg.active) {
                    sendConfigToSW(reg, lang);
                } else {
                    const sw = reg.installing || reg.waiting;
                    if (sw) {
                        sw.addEventListener('statechange', () => {
                            if (sw.state === 'activated') {
                                sendConfigToSW(reg, lang);
                            }
                        });
                    }
                }
            }
        });
    }, [lang]);

    // Session veya userId değişince SW'ye tekrar config gönder
    useEffect(() => {
        if (swReg.current && swReg.current.active) {
            sendConfigToSW(swReg.current, lang);
        }
    }, [sessions.length, lang]);

    // SW'yi canlı tut — heartbeat + visibility change + keep-alive fetch
    useEffect(() => {
        // Heartbeat: SW'ye periyodik mesaj göndererek uyumasını engelle
        const heartbeatInterval = setInterval(() => {
            if (swReg.current?.active) {
                swReg.current.active.postMessage({ type: 'HEARTBEAT' });
            }
            // Keep-alive fetch — SW'nin fetch event'ini tetikler
            fetch('/api/keep-alive').catch(() => { });
        }, 50 * 1000); // 50 saniyede bir

        // Visibility change: Kullanıcı uygulamaya dönünce SW'yi tetikle
        const handleVisibility = () => {
            if (document.visibilityState === 'visible' && swReg.current?.active) {
                swReg.current.active.postMessage({ type: 'HEARTBEAT' });
                sendConfigToSW(swReg.current, lang);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(heartbeatInterval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [lang]);

    // İzin isteme
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return 'unsupported';
        const result = await Notification.requestPermission();
        setPermission(result);
        console.log('[Notification] İzin durumu:', result);
        return result;
    }, []);

    // Bildirim gönderme (uygulama açıkken SW'ye mesaj)
    const sendNotification = useCallback((title, body, tag) => {
        if (permission !== 'granted') {
            console.log('[Notification] ⚠️ İzin yok:', permission);
            return;
        }
        console.log('[Notification] 📤 Bildirim:', title, '-', body);
        if (swReg.current && swReg.current.active) {
            swReg.current.active.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag });
        } else {
            try { new Notification(title, { body, tag, icon: '/icons/icon.svg' }); } catch (e) { /* */ }
        }
    }, [permission]);

    // Test bildirimi
    const sendTestNotification = useCallback(() => {
        if (permission !== 'granted') return false;
        const title = t ? t('notification.title') : '🔔 Test';
        const body = t
            ? t('notification.body').replace('{minutes}', '15').replace('{client}', 'Test Danışan')
            : '15 dk sonra Test Danışan ile görüşmeniz var!';
        sendNotification(title, body, 'test_' + Date.now());
        return true;
    }, [permission, sendNotification, t]);

    // Uygulama açıkken de in-app kontrol (çan ikonu badge'i için)
    useEffect(() => {
        if (!sessions.length || !t) return;

        const checkUpcoming = () => {
            const now = new Date();
            const newAlerts = [];

            sessions.forEach((session) => {
                if (session.status !== 'scheduled') return;
                const sessionDate = new Date(session.date);
                const diffMinutes = (sessionDate.getTime() - now.getTime()) / (1000 * 60);

                if (diffMinutes > 0 && diffMinutes <= REMINDER_MINUTES) {
                    const client = getClientById ? getClientById(session.clientId) : null;
                    const clientName = client ? `${client.firstName} ${client.lastName}` : t('calendar.unknown');
                    const minutesLeft = Math.ceil(diffMinutes);
                    const alertId = `${session.id}_${REMINDER_MINUTES}`;

                    newAlerts.push({
                        id: alertId,
                        sessionId: session.id,
                        clientName,
                        minutesLeft,
                        sessionDate: session.date,
                        sessionType: session.sessionType || 'face_to_face',
                        read: false,
                    });

                    if (!notifiedIds.current.has(alertId)) {
                        notifiedIds.current.add(alertId);
                        // Uygulama açıkken de push gönder (SW arka plandakini zaten handle ediyor)
                        sendNotification(
                            t('notification.title'),
                            t('notification.body').replace('{minutes}', minutesLeft).replace('{client}', clientName),
                            alertId
                        );
                    }
                }
            });

            if (newAlerts.length > 0) {
                setUpcomingAlerts((prev) => {
                    const merged = [...prev];
                    newAlerts.forEach((na) => {
                        const idx = merged.findIndex((a) => a.sessionId === na.sessionId);
                        if (idx >= 0) {
                            merged[idx] = { ...merged[idx], minutesLeft: na.minutesLeft };
                        } else {
                            merged.push(na);
                        }
                    });
                    return merged;
                });
                setUnreadCount((prev) => {
                    const currentIds = new Set(alertsRef.current.map((a) => a.sessionId));
                    const newOnes = newAlerts.filter((na) => !currentIds.has(na.sessionId));
                    return prev + newOnes.length;
                });
            }

            setUpcomingAlerts((prev) =>
                prev.filter((a) => new Date(a.sessionDate).getTime() > now.getTime())
            );
        };

        checkUpcoming();
        const interval = setInterval(checkUpcoming, CHECK_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [sessions, getClientById, t, sendNotification]);

    const markAllRead = useCallback(() => {
        setUpcomingAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
        setUnreadCount(0);
    }, []);

    const dismissAlert = useCallback((alertId) => {
        setUpcomingAlerts((prev) => prev.filter((a) => a.id !== alertId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    // Logout olunca SW config temizle
    const clearSWConfig = useCallback(() => {
        if (swReg.current && swReg.current.active) {
            swReg.current.active.postMessage({ type: 'CLEAR_CONFIG' });
        }
    }, []);

    return {
        permission,
        requestPermission,
        upcomingAlerts,
        unreadCount,
        markAllRead,
        dismissAlert,
        sendNotification,
        sendTestNotification,
        clearSWConfig,
    };
};
