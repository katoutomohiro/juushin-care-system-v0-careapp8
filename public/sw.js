// Service Worker for notifications (minimal skeleton)
// Cache strategy and advanced features to be added in future iterations

self.addEventListener('install', () => {
  console.log('[SW] install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || '/';

  event.waitUntil(
    (async () => {
      try {
        const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        const targetUrl = new URL(target, self.location.origin).href;

        for (const client of windowClients) {
          if (!client?.url) continue;
          const clientUrl = new URL(client.url, self.location.origin).href;
          if (clientUrl === targetUrl && typeof client.focus === 'function') {
            await client.focus();
            return;
          }
        }

        if (typeof clients.openWindow === 'function') {
          await clients.openWindow(target);
        }
      } catch (_err) {
        console.warn('[SW] notificationclick handler failed:', _err);
      }
    })(),
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    try {
      payload = { body: event.data?.text() };
    } catch {
      payload = {};
    }
  }

  const title = payload.title || 'Care App 通知';
  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/badge-96.png',
    data: payload.data || {},
    tag: payload.tag || 'care-app-alert',
    requireInteraction: payload.requireInteraction ?? false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
