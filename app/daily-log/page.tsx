import { userDetails } from "@/lib/user-master-data"
import DailyLogPageClient from "./_components/daily-log-page-client"

export default async function DailyLogPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const users = Object.entries(userDetails).map(([id, detail]) => ({ id, name: detail.name }))
  const initialUserId = resolvedSearchParams.user || (users.length ? users[0].id : "")

  return <DailyLogPageClient users={users} initialUserId={initialUserId} />
}
