import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "@/contexts/user-context"
import { ClientLayoutWrapper } from "./_components/client-layout-wrapper"

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
