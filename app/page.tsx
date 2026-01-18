export const dynamic = "force-dynamic"
import LoginPage from "./login/page"

export default function Page() {
  // ルートは常にログイン画面を表示し、careReceiverId を扱わない
  return <LoginPage />
}
