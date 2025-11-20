import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import dynamic from "next/dynamic"
import { UserProvider } from "@/contexts/user-context"

// Hydration error 対策：Push 通知関連コンポーネントは SSR を無効化
// ブラウザ API (navigator, window) に依存するため、クライアント側のみで読み込む
const ServiceWorkerRegistration = dynamic(
  () => import("./service-worker-registration").then((mod) => ({ default: mod.ServiceWorkerRegistration })),
  { ssr: false }
)
const PushSubscriptionButton = dynamic(
  () => import("./service-worker-registration").then((mod) => ({ default: mod.PushSubscriptionButton })),
  { ssr: false }
)

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "重心ケアアプリ - PROJECT",
  description: "日誌とAI連携でケア記録を最適化します。",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <ServiceWorkerRegistration />
        <div className="fixed bottom-4 right-4 z-50 flex max-w-xs flex-col items-end gap-2 rounded bg-white/90 p-3 shadow">
          <PushSubscriptionButton />
        </div>
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster />
      </body>
    </html>
  )
}
