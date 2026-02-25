import { useState, useEffect, useCallback, useRef } from 'react';

// ============ Bildirim izin durumu ============
const getPermissionStatus = () => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
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

// ============ Hook ============
const REMINDER_MINUTES = 15;
const CHECK_INTERVAL_MS = 30 * 1000; // Her 30 saniyede bir kontrol

export const useNotifications = (sessions = [], getClientById, t) => {
    const [permission, setPermission] = useState(getPermissionStatus);
    const [upcomingAlerts, setUpcomingAlerts] = useState([]); // In-app bildirim listesi
    const [unreadCount, setUnreadCount] = useState(0);
    const notifiedIds = useRef(new Set()); // Zaten bildirim gönderilmiş seanslar
    const swReg = useRef(null);

    // SW kayıt
    useEffect(() => {
        registerSW().then((reg) => {
            swReg.current = reg;
        });
    }, []);

    // İzin isteme
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return 'unsupported';
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    }, []);

    // Bildirim gönderme (SW üzerinden veya fallback)
    const sendNotification = useCallback((title, body, tag) => {
        if (permission !== 'granted') return;

        // Service Worker varsa onun üzerinden gönder (arka planda da çalışır)
        if (swReg.current && swReg.current.active) {
            swReg.current.active.postMessage({
                type: 'SHOW_NOTIFICATION',
                title,
                body,
                tag,
                icon: '/icons/icon.svg',
            });
        } else {
            // Fallback: doğrudan Notification API
            try {
                new Notification(title, {
                    body,
                    tag,
                    icon: '/icons/icon.svg',
                });
            } catch {
                // Mobile'da Notification constructor yoksa sessizce geç
            }
        }
    }, [permission]);

    // Her 30 saniyede seansları kontrol et
    useEffect(() => {
        if (!sessions.length || !t) return;

        const checkUpcoming = () => {
            const now = new Date();
            const newAlerts = [];

            sessions.forEach((session) => {
                // Sadece planlanmış seanslar
                if (session.status !== 'scheduled') return;

                const sessionDate = new Date(session.date);
                const diffMs = sessionDate.getTime() - now.getTime();
                const diffMinutes = diffMs / (1000 * 60);

                // 0 ile REMINDER_MINUTES dakika arası: bildirim zamanı
                if (diffMinutes > 0 && diffMinutes <= REMINDER_MINUTES) {
                    const client = getClientById ? getClientById(session.clientId) : null;
                    const clientName = client
                        ? `${client.firstName} ${client.lastName}`
                        : t('calendar.unknown');

                    const minutesLeft = Math.ceil(diffMinutes);
                    const alertId = `${session.id}_${REMINDER_MINUTES}`;

                    // In-app listeye ekle
                    newAlerts.push({
                        id: alertId,
                        sessionId: session.id,
                        clientName,
                        minutesLeft,
                        sessionDate,
                        sessionType: session.sessionType || 'face_to_face',
                        read: false,
                    });

                    // Henüz push bildirim gönderilmediyse gönder
                    if (!notifiedIds.current.has(alertId)) {
                        notifiedIds.current.add(alertId);

                        const title = t('notification.title');
                        const body = t('notification.body')
                            .replace('{minutes}', minutesLeft)
                            .replace('{client}', clientName);

                        sendNotification(title, body, alertId);
                    }
                }
            });

            if (newAlerts.length > 0) {
                setUpcomingAlerts((prev) => {
                    // Eski alert'leri koru, yenileri ekle/güncelle
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
                    const newOnes = newAlerts.filter(
                        (na) => !upcomingAlerts.some((a) => a.sessionId === na.sessionId)
                    );
                    return prev + newOnes.length;
                });
            }

            // Geçmiş olanları temizle
            setUpcomingAlerts((prev) =>
                prev.filter((a) => new Date(a.sessionDate).getTime() > now.getTime())
            );
        };

        // İlk kontrol
        checkUpcoming();

        // Periyodik kontrol
        const interval = setInterval(checkUpcoming, CHECK_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [sessions, getClientById, t, permission, sendNotification]);

    // Tüm bildirimleri okundu yap
    const markAllRead = useCallback(() => {
        setUpcomingAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
        setUnreadCount(0);
    }, []);

    // Tek bildirimi kaldır
    const dismissAlert = useCallback((alertId) => {
        setUpcomingAlerts((prev) => prev.filter((a) => a.id !== alertId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    return {
        permission,
        requestPermission,
        upcomingAlerts,
        unreadCount,
        markAllRead,
        dismissAlert,
        sendNotification,
    };
};
