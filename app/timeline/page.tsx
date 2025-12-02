import "server-only";
import { UserTimeline } from "./_components/user-timeline";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedUser = resolvedSearchParams?.user ?? "";

  const timeline = await UserTimeline({
    heading: "利用者タイムライン",
    showUserSelector: true,
    searchParamsUser: selectedUser,
    userId: selectedUser || undefined,
  })

  return timeline;
}
