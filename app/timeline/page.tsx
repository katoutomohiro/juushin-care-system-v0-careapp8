import "server-only";
import { UserTimeline } from "./_components/user-timeline";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: { user?: string };
}) {
  const selectedUser = searchParams.user ?? "";

  return (
    <UserTimeline
      heading="利用者タイムライン（ダミー）"
      showUserSelector={true}
      searchParamsUser={selectedUser}
      // 現段階では selectedUser をそのまま userId に渡さない
      // 将来的に selectedUser が UUID なら userId に渡す設計にする予定
    />
  );
}
