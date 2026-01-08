import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CaseRecordFormClient } from "@/src/components/case-records/CaseRecordFormClient"
import { getTemplate } from "@/lib/templates/getTemplate"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function CaseRecordsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceId: string; userId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const serviceId = resolvedParams.serviceId
  const userId = decodeURIComponent(resolvedParams.userId)

  // Determine careReceiverId from searchParams or use userId as fallback
  const idParam = resolvedSearchParams.careReceiverId
  const careReceiverId = typeof idParam === "string" ? idParam : userId

  // Fetch template for this care receiver
  const template = getTemplate(careReceiverId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/services/${serviceId}/users/${encodeURIComponent(userId.replace(/・/g, "").trim())}`}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              ← {userId}の詳細に戻る
            </Link>
            <div>
              <h1 className="text-2xl font-bold">ケース記録</h1>
              <p className="text-sm text-muted-foreground">{userId}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!careReceiverId || careReceiverId === "" ? (
          <Card>
            <CardHeader>
              <CardTitle>ケース記録</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                利用者が指定されていません。ユーザー詳細から再度アクセスしてください。
              </p>
            </CardContent>
          </Card>
        ) : (
          <CaseRecordFormClient
            careReceiverId={careReceiverId}
            userId={userId}
            serviceId={serviceId}
            template={template}
          />
        )}
      </main>
    </div>
  )
}
