'use client'
import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import CommonDiary from '@/components/diary/CommonDiary'

export default function ServiceUserDiaryPage({ params }: { params: Promise<{ serviceId: string; userId: string }> }) {
  const { serviceId, userId } = use(params)
  const search = useSearchParams()
  const careReceiverId = search.get('careReceiverId') ?? undefined
  return (
    <div className="p-4">
      <CommonDiary serviceId={serviceId} userId={userId} careReceiverId={careReceiverId} />
    </div>
  )
}
