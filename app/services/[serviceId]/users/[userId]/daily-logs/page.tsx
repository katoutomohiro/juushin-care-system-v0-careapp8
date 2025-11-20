import { UserDailyLogTimeline } from "@/app/daily-log/_components/user-daily-log-timeline"

export default async function UserDailyLogsPage({
  params,
}: {
  params: { serviceId: string; userId: string }
}) {
  const { userId } = params

  return (
    <UserDailyLogTimeline
      heading={`${decodeURIComponent(userId)} - 日誌タイムライン`}
      userId={userId}
      showUserSelector={false}
    />
  )
}
