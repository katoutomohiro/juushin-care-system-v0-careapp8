import "server-only";
import { UserTimeline } from "@/app/timeline/_components/user-timeline";

interface UserTimelinePageProps {
  params: {
    serviceId: string;
    userId: string;
  };
}

/**
 * /services/[serviceId]/users/[userId]/timeline
 *
 * 特定の利用者に絞られたタイムラインを表示するページ。
 *
 * 前提:
 * - /services/[serviceId]/users/[userId] の [userId] が
 *   public.seizures.user_id と一致する設計
 * - 現時点で一致していなくても、DB側を揃えれば動く
 *
 * 現段階:
 * - serviceId はまだ使わず、userId の発作記録だけに絞ったタイムラインを表示
 * - 将来、サービスごとの絞り込みが必要になったら拡張予定
 */
export default async function UserTimelinePage({ params }: UserTimelinePageProps) {
  const { userId } = params;
  // serviceId は将来の拡張用に残しておく

  return (
    <UserTimeline
      heading="利用者タイムライン（サービス内ビュー）"
      showUserSelector={false}
      userId={userId}
    />
  );
}
