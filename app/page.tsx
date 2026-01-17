export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default function Page() {
  // searchParams を読まない（キャッシュを防ぐため）
  // / ページでは initialCareReceiverId を渡さない
  // 利用者選択は UI 上でドロップダウンから行う
  return <HomeClient initialCareReceiverId={undefined} />
}
