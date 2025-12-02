import "server-only";
import { UserDailyLogTimeline } from "@/app/daily-log/_components/user-daily-log-timeline";

export default async function UserDailyLogsPage({
  params,
}: {
  params: Promise<{ serviceId: string; userId: string }>;
}) {
  const resolvedParams = await params;
  const { serviceId, userId } = resolvedParams;
  const decodedUserId = decodeURIComponent(userId);

  return (
    <UserDailyLogTimeline
      heading={`利用者の日誌タイムライン - ${decodedUserId}`}
      userId={decodedUserId}
      serviceId={serviceId}
      viewAllHref={`/daily-log?user=${encodeURIComponent(decodedUserId)}&service=${serviceId}`}
    />
  );
}
