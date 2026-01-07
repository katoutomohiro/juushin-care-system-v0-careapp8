// Service Worker for notifications
// Prevents stale cache from causing React errors by enforcing Network First for HTML
// and excluding Next.js build artifacts from caching

const VERSION = '1.0.0';
const CACHE_NAME = `app-cache-v${VERSION}`;

self.addEventListener('install', () => {
  console.log('[SW] install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  // Remove old caches to prevent stale assets
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
      // Claim all clients to ensure immediate control
      return self.clients.claim();
    })()
  );
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
