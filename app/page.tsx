export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default function Page() {
  // searchParams を読まない。careReceiverId は初期表示で扱わない。
  return <HomeClient initialCareReceiverId={undefined} />
}
