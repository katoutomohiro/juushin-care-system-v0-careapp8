// Service Worker for notifications (minimal skeleton)
// Cache strategy and advanced features to be added in future iterations

self.addEventListener('install', (event) => {
  console.log('[SW] install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  const url = event.notification?.data?.url;
  event.notification.close();
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
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
