/**
 * 通知管理
 */

/**
 * Notification APIの許可を要求
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[requestPermission] Notification API not supported');
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  // 'default' → ユーザーに許可を求める
  return await Notification.requestPermission();
}

/**
 * Service Workerを登録（/sw.js）
 */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[registerServiceWorker] Service Worker not supported');
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[registerServiceWorker] registered:', registration.scope);
  } catch (err) {
    console.warn('[registerServiceWorker] failed:', err);
  }
}

/**
 * ローカル通知を表示（Service Worker経由）
 */
export async function notifyLocal(title: string, body?: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.warn('[notifyLocal] Service Worker or Notification API not available');
    return;
  }
  if (Notification.permission !== 'granted') {
    console.warn('[notifyLocal] Notification permission not granted');
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body: body || '',
      icon: '/icon-192.png', // Future: アイコン画像を追加
      badge: '/badge-96.png',
      tag: 'care-app-alert',
      requireInteraction: false,
    });
  } catch (err) {
    console.error('[notifyLocal] failed:', err);
  }
}

/**
 * 旧関数（互換性のため残す）
 */
export function scheduleReminder(time: string, message: string): void {
  // stub: 将来実装
  console.log(`[scheduleReminder] ${time}: ${message}`);
}
