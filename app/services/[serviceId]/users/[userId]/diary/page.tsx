'use client'
import { use } from 'react'
import CommonDiary from '@/components/diary/CommonDiary'

export default function ServiceUserDiaryPage({ params }: { params: Promise<{ serviceId: string; userId: string }> }) {
  const { serviceId, userId } = use(params)
  return (
    <div className="p-4">
      <CommonDiary serviceId={serviceId} userId={userId} />
    </div>
  )
}
