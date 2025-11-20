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
      heading="利用者タイムライン"
      showUserSelector={true}
      searchParamsUser={selectedUser}
      // selectedUser が指定されていれば Supabase クエリに適用される
      // 空文字の場合は undefined として全利用者を表示
      userId={selectedUser || undefined}
    />
  );
}
