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
 * 必要時のみ許可を要求し、結果をbooleanで返す
 */
export async function ensurePermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
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
export async function notifyLocal(opts: { title: string; body?: string; data?: any; icon?: string; tag?: string }): Promise<void> {
  const { title, body = '', data, icon = '/icon-192.png', tag = 'care-app-alert' } = opts;
  const canNotify = 'serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted';
  if (canNotify) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon,
        badge: '/badge-96.png',
        tag,
        requireInteraction: false,
        data,
      });
      return;
    } catch (err) {
      console.warn('[notifyLocal] showNotification failed, fallback to toast:', err);
    }
  }
  // fallback: toast
  try {
    const { toast } = await import('sonner');
    toast(title + (body ? ` — ${body}` : ''));
  } catch {
    console.log('[notifyLocal:fallback]', title, body);
  }
}

/**
 * 旧関数（互換性のため残す）
 */
export function scheduleReminder(time: string, message: string): void {
  // stub: 将来実装
  console.log(`[scheduleReminder] ${time}: ${message}`);
}
