import { UserDailyLogTimeline } from "./_components/user-daily-log-timeline";

export default async function DailyLogPage({
  searchParams,
}: {
  searchParams: { user?: string };
}) {
  const selectedUser = searchParams.user || undefined;

  return (
    <UserDailyLogTimeline
      heading="日誌タイムライン（全体）"
      showUserSelector={true}
      searchParamsUser={selectedUser}
      userId={selectedUser}
    />
  );
}
