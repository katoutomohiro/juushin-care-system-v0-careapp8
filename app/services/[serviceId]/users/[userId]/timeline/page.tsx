import "server-only"
import { UserTimeline } from "@/app/timeline/_components/user-timeline"

/**
 * /services/[serviceId]/users/[userId]/timeline
 *
 * ����̗��p�҂ɍi�����^�C�����C����\������y�[�W�B
 * serviceId �͏����̊g���p�ɕێ����Ă����B
 */
export default async function UserTimelinePage({
  params,
}: {
  params: Promise<{ serviceId: string; userId: string }>
}) {
  const resolvedParams = await params
  const userId = decodeURIComponent(resolvedParams.userId)

  const timeline = await UserTimeline({
    heading: "���p�҃^�C�����C���i�T�[�r�X�ʃr���[�j",
    showUserSelector: false,
    userId,
  })

  return timeline
}
