import CommonDiary from "@/components/diary/CommonDiary"

type PageProps = {
  params: Promise<{ serviceId: string; userId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ServiceUserDiaryPage({ params, searchParams }: PageProps) {
  const { serviceId, userId } = await params
  const sp = await searchParams
  const raw = sp?.careReceiverId
  const careReceiverId = typeof raw === "string" ? raw : undefined

  return (
    <div className="p-4">
      <CommonDiary serviceId={serviceId} userId={userId} careReceiverId={careReceiverId} />
    </div>
  )
}
