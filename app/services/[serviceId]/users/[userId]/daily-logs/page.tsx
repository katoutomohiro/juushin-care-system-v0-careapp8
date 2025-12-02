import { UserDailyLogTimeline } from "@/app/daily-log/_components/user-daily-log-timeline"

export default async function UserDailyLogsPage({
  params,
}: {
  params: Promise<{ serviceId: string; userId: string }>
}) {
  const resolvedParams = await params
  const decodedUserId = decodeURIComponent(resolvedParams.userId)
  const { serviceId } = resolvedParams

  return (
    <UserDailyLogTimeline
      heading={`${decodedUserId} - 日誌タイムライン`}
      userId={decodedUserId}
      serviceId={serviceId}
      viewAllHref={`/daily-log?user=${encodeURIComponent(decodedUserId)}&service=${serviceId}`}
    />
  )
}
