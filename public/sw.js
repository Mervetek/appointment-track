// PsikoTakip — Service Worker for Notifications
const CACHE_NAME = 'psikotakip-v1';

// Install
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
        // Store sessions for background check
        self.sessions = event.data.sessions || [];
    }
});

// Show notification from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, tag, icon } = event.data;
        self.registration.showNotification(title, {
            body,
            tag,
            icon: icon || '/icons/icon.svg',
            badge: '/icons/icon.svg',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            actions: [
                { action: 'open', title: '📅 Aç' },
                { action: 'dismiss', title: '✖ Kapat' },
            ],
        });
    }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open the app
            if (self.clients.openWindow) {
                return self.clients.openWindow('/');
            }
        })
    );
});
