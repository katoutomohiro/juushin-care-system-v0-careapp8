export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default function Page() {
  // searchParams を読み込まない
  // ログインチェックは middleware 側や Supabase auth で行う想定 
  return <HomeClient />
}
