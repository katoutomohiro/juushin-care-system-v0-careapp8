import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider as AppToastProvider } from "@/components/ui/toast"

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

// （任意）タイトルなど
export const metadata: Metadata = {
  title: "重心ケアアプリ - PROJECT",
  description: "日誌→A4自動反映対応",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AppToastProvider>
          {children}
          <Toaster />
        </AppToastProvider>
      </body>
    </html>
  )
}
