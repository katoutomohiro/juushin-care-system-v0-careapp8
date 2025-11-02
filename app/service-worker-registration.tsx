'use client';
import { useEffect } from 'react';
import { registerServiceWorker, requestPermission } from '../lib/notifications';

/**
 * Service Worker登録と通知許可要求
 * layoutから呼び出す（クライアント側のみ実行）
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // SW登録
    registerServiceWorker().catch((err) => {
      console.warn('[ServiceWorkerRegistration] registerServiceWorker failed:', err);
    });

    // 通知許可要求（ユーザー操作後に行うのが推奨だが、ここではアプリ起動時に試行）
    requestPermission().catch((err) => {
      console.warn('[ServiceWorkerRegistration] requestPermission failed:', err);
    });
  }, []);

  return null; // UIなし
}
