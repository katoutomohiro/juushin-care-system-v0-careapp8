"use client"

import dynamic from "next/dynamic"
import { FEATURES } from "@/config/features"

// Hydration error 対策：Push 通知関連コンポーネントは SSR を無効化
// ブラウザ API (navigator, window) に依存するため、クライアント側のみで読み込む
const ServiceWorkerRegistration = dynamic(
  () => import("../service-worker-registration").then((mod) => ({ default: mod.ServiceWorkerRegistration })),
  { ssr: false }
)
const PushSubscriptionButton = dynamic(
  () => import("../service-worker-registration").then((mod) => ({ default: mod.PushSubscriptionButton })),
  { ssr: false }
)

export function ClientLayoutWrapper() {
  return (
    <>
      <ServiceWorkerRegistration />
      {FEATURES.pushNotifications && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-xs flex-col items-end gap-2 rounded bg-white/90 p-3 shadow">
          <PushSubscriptionButton />
        </div>
      )}
    </>
  )
}
