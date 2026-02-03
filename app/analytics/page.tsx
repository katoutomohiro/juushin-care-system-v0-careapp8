import { redirect } from "next/navigation"
import { getApiUser } from "@/lib/auth/get-api-user"
import AnalyticsPageClient from "./analytics-client"

export const metadata = {
  title: "Records Analytics - 重心ケアアプリ",
  description: "ケア記録の期間別集計と分析",
}

export default async function AnalyticsPage() {
  // サーバーサイドで認証確認
  const user = await getApiUser()
  if (!user) {
    redirect("/login")
  }

  return <AnalyticsPageClient />
}
