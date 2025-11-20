import "server-only";
import { UserDailyLogTimeline } from "@/app/daily-log/_components/user-daily-log-timeline";

export default async function UserDailyLogsPage({
  params,
}: {
  params: { serviceId: string; userId: string };
}) {
  const { userId } = params;
  const decodedUserId = decodeURIComponent(userId);

  return (
    <UserDailyLogTimeline
      heading={`利用者の日誌タイムライン - ${decodedUserId}`}
      userId={decodedUserId}
      showUserSelector={false}
    />
  );
}
