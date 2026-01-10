import { CaseRecordFormClient } from "@/src/components/case-records/CaseRecordFormClient"
import { getTemplate } from "@/lib/templates/getTemplate"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"
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
  const rawUserId = resolvedParams.userId
  let displayUserId = rawUserId
  try {
    displayUserId = decodeURIComponent(rawUserId)
  } catch {
    displayUserId = rawUserId
  }
  
  // Normalize to internal ID (e.g., "A・T" → "AT")
  const internalUserId = normalizeUserId(rawUserId)

  // Determine careReceiverId from searchParams or use normalized userId as fallback
  const idParam = resolvedSearchParams.careReceiverId
  const careReceiverId = normalizeUserId(typeof idParam === "string" ? idParam : internalUserId) || internalUserId

  // Fetch template for this care receiver
  const template = getTemplate(careReceiverId)
  const now = new Date()
  const initialDate = now.toISOString().split("T")[0]
  const initialTime = now.toTimeString().split(" ")[0].substring(0, 5)

  // Debug logging (always enabled for now to diagnose issues)
  console.log("[case-records] Debug info:", {
    rawUserId,
    displayUserId,
    internalUserId,
    careReceiverId,
    template_found: !!template,
    template_name: template?.name,
    template_fields_count: template?.customFields?.length ?? 0,
    searchParams_careReceiverId: idParam,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/services/${serviceId}/users/${encodeURIComponent(internalUserId)}`}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              ← {displayUserId}の詳細に戻る
            </Link>
            <div>
              <h1 className="text-2xl font-bold">ケース記録</h1>
              <p className="text-sm text-muted-foreground">{displayUserId}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CaseRecordFormClient
          careReceiverId={careReceiverId}
          userId={internalUserId}
          serviceId={serviceId}
          template={template}
          initialDate={initialDate}
          initialTime={initialTime}
        />
      </main>
    </div>
  )
}
