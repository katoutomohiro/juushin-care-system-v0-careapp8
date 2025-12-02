import { format } from "date-fns"
import { userDetails } from "@/lib/user-master-data"
import { buildUserProfileFromUserDetail } from "@/types/user-profile"
import {
  fetchCaseRecordDates,
  fetchStructuredCaseRecord,
  normalizeATCaseRecordContent,
  resolveCaseRecordTemplate,
  type ATCaseRecordContent,
} from "@/lib/case-records"
import { listStaffMembers } from "@/lib/staff"
import { AT_STAFF_FALLBACK_OPTIONS, SERVICE_LABELS } from "@/lib/case-record-constants"
import CaseRecordClient from "./_components/case-record-client"

interface PageProps {
  params: Promise<{ serviceId: string; userId: string }>
  searchParams?: Promise<{ date?: string }>
}

function formatDateLabel(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
  } catch {
    return dateStr
  }
}

async function CaseRecordHistory({
  userId,
  serviceId,
  activeDate,
}: {
  userId: string
  serviceId: string
  activeDate: string
}) {
  let dates: string[] = []
  try {
    dates = await fetchCaseRecordDates({ userId, serviceType: serviceId })
  } catch (e) {
    console.error("[CaseRecordHistory] failed to load dates", e)
    dates = []
  }
  if (!dates.length) return null
  return (
    <div className="rounded-lg border bg-card/60 p-3">
      <div className="text-sm font-semibold mb-2">過去1年のケース記録</div>
      <div className="flex flex-wrap gap-2">
        {dates.map((d) => {
          const href = `/services/${serviceId}/users/${encodeURIComponent(userId)}/case-records?date=${d}`
          const isActive = d === activeDate
          return (
            <a
              key={d}
              href={href}
              className={`rounded-md border px-3 py-1 text-sm transition ${
                isActive ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
              }`}
            >
              {formatDateLabel(d)}
            </a>
          )
        })}
      </div>
    </div>
  )
}


export default async function CaseRecordsPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const { serviceId } = resolvedParams
  const userId = decodeURIComponent(resolvedParams.userId)
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const dateStr = resolvedSearchParams?.date || format(new Date(), "yyyy-MM-dd")
  const detail = userDetails[userId]
  if (!detail) {
    return <div className="p-6">利用者が見つかりません</div>
  }

  const profile = buildUserProfileFromUserDetail(detail)
  const template = resolveCaseRecordTemplate(userId)
  const headerDefaults = {
    userName: detail.name,
    age: profile.age ? String(profile.age) : "",
    sex: profile.gender || "",
    serviceName: SERVICE_LABELS[serviceId] || serviceId,
  }
  const existingRow = await fetchStructuredCaseRecord(userId, serviceId, dateStr).catch(() => null)
  const persistedContent = existingRow?.content?.template === template ? existingRow.content.data : null
  const initialContent: ATCaseRecordContent = normalizeATCaseRecordContent(persistedContent, dateStr, headerDefaults)
  const historySection = await CaseRecordHistory({ userId, serviceId, activeDate: dateStr })
  let staffOptions: { id: string; name: string }[] = []
  try {
    const staff = await listStaffMembers({ activeOnly: true })
    staffOptions = (staff || []).map((s) => ({ id: s.id, name: s.name }))
  } catch (e) {
    console.error("[CaseRecordsPage] failed to load staff members", e)
  }
  if (!staffOptions.length) {
    staffOptions = AT_STAFF_FALLBACK_OPTIONS
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {historySection}
      <CaseRecordClient userId={userId} serviceId={serviceId} initialContent={initialContent} staffOptions={staffOptions} />
    </div>
  )
}
