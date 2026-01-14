import { CaseRecordFormClient } from "@/src/components/case-records/CaseRecordFormClient"
import { getTemplate } from "@/lib/templates/getTemplate"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function CaseRecordsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceId: string; userId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const serviceIdInput = resolvedParams.serviceId
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
  const careReceiverCodeOrUuid = normalizeUserId(typeof idParam === "string" ? idParam : internalUserId) || internalUserId

  // A) Resolve careReceiverId to UUID
  let careReceiverUuid: string
  if (uuidRegex.test(careReceiverCodeOrUuid)) {
    careReceiverUuid = careReceiverCodeOrUuid
  } else {
    // Lookup by code
    if (!supabaseAdmin) {
      console.error("[case-records page] Supabase admin not available")
      notFound()
    }
    const { data: careReceiver } = await supabaseAdmin
      .from("care_receivers")
      .select("id")
      .eq("code", careReceiverCodeOrUuid)
      .maybeSingle()
    if (!careReceiver?.id) {
      console.error("[case-records page] care_receiver not found for code:", careReceiverCodeOrUuid)
      notFound()
    }
    careReceiverUuid = careReceiver.id
  }

  // Resolve serviceId to UUID (same pattern)
  let serviceUuid: string
  if (uuidRegex.test(serviceIdInput)) {
    serviceUuid = serviceIdInput
  } else {
    if (!supabaseAdmin) {
      console.error("[case-records page] Supabase admin not available")
      notFound()
    }
    const { data: service } = await supabaseAdmin
      .from("services")
      .select("id")
      .eq("slug", serviceIdInput)
      .maybeSingle()
    if (!service?.id) {
      console.error("[case-records page] service not found for slug:", serviceIdInput)
      notFound()
    }
    serviceUuid = service.id
  }

  const careReceiverId = careReceiverCodeOrUuid

  // Fetch template for this care receiver
  const template = getTemplate(careReceiverId)
  const now = new Date()
  const initialDate = now.toISOString().split("T")[0]

  // Fetch care receiver details to get the latest display name (DB first)
  let careReceiverName = ""
  
  if (supabaseAdmin && careReceiverUuid) {
    const { data: careReceiver } = await supabaseAdmin
      .from("care_receivers")
      .select("name, display_name")
      .eq("id", careReceiverUuid)
      .maybeSingle()

    if (careReceiver?.name) {
      careReceiverName = careReceiver.name
    } else if (careReceiver?.display_name) {
      careReceiverName = careReceiver.display_name
    }
  }

  // Last-resort fallback to URL userId if DB lookup failed (keeps UI stable)
  if (!careReceiverName) {
    careReceiverName = displayUserId
  }

  // Debug logging (always enabled for now to diagnose issues)
  console.log("[case-records] Debug info:", {
    rawUserId,
    displayUserId,
    internalUserId,
    careReceiverId,
    careReceiverUuid,
    serviceUuid,
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
              href={`/services/${serviceIdInput}/users/${encodeURIComponent(internalUserId)}`}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              ← {careReceiverName || displayUserId}の詳細に戻る
            </Link>
            <div>
              <h1 className="text-2xl font-bold">ケース記録</h1>
              <p className="text-sm text-muted-foreground">{careReceiverName || displayUserId}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CaseRecordFormClient
          careReceiverId={careReceiverId}
          careReceiverUuid={careReceiverUuid}
          careReceiverName={careReceiverName}
          userId={internalUserId}
          serviceId={serviceIdInput}
          serviceUuid={serviceUuid}
          template={template}
          initialDate={initialDate}
        />
      </main>
    </div>
  )
}
