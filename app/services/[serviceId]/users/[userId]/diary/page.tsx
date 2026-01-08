import CommonDiary from '@/components/diary/CommonDiary'

export default async function ServiceUserDiaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceId: string; userId: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { serviceId, userId } = await params
  const sp = searchParams ? await searchParams : undefined
  const idParam = sp?.careReceiverId
  const careReceiverId = typeof idParam === 'string' ? idParam : undefined
  return (
    <div className="p-4">
      <CommonDiary serviceId={serviceId} userId={userId} careReceiverId={careReceiverId} />
    </div>
  )
}
