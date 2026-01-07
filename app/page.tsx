export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default async function Page({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = searchParams ? await searchParams : undefined
  const idParam = params?.careReceiverId
  const initialCareReceiverId = typeof idParam === "string" ? idParam : undefined
  return <HomeClient initialCareReceiverId={initialCareReceiverId} />
}
