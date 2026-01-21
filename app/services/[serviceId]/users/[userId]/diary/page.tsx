import CommonDiary from "@/components/diary/CommonDiary"

type PageProps = {
  params: { serviceId: string; userId: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function ServiceUserDiaryPage({ params, searchParams }: PageProps) {
  const { serviceId, userId } = params
  const raw = searchParams?.careReceiverId
  const careReceiverId = typeof raw === "string" ? raw : undefined

  return (
    <div className="p-4">
      <CommonDiary serviceId={serviceId} userId={userId} careReceiverId={careReceiverId} />
    </div>
  )
}
