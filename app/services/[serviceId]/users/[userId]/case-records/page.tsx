import { format } from "date-fns"
import { userDetails } from "@/lib/user-master-data"
import { buildUserProfileFromUserDetail } from "@/types/user-profile"
import {
  fetchCaseRecordDates,
  fetchStructuredCaseRecord,
  getDefaultATCaseRecordContent,
  resolveCaseRecordTemplate,
  type ATCaseRecordContent,
} from "@/lib/case-records"
import CaseRecordClient from "./_components/case-record-client"

interface PageProps {
  params: { serviceId: string; userId: string }
  searchParams?: { date?: string }
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
  const dates = await fetchCaseRecordDates({ userId, serviceType: serviceId })
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

function normalizeContent(data: any, base: ATCaseRecordContent): ATCaseRecordContent {
  if (data?.front && data?.back) {
    return {
      front: { ...base.front, ...data.front, date: base.front.date },
      back: { ...base.back, ...data.back },
    }
  }

  const legacy = data || {}
  return {
    front: {
      ...base.front,
      breakfast: legacy.meals?.breakfast?.text || "",
      lunch: legacy.meals?.lunch?.text || "",
      snack: legacy.meals?.snack?.text || "",
      dinner: legacy.meals?.dinner?.text || "",
      hydration1: legacy.meals?.totalWaterIntakeMl ? `総水分 ${legacy.meals.totalWaterIntakeMl}ml` : "",
      elimination1: legacy.elimination || "",
      bathing: legacy.bathing || "",
      task1Note: legacy.task1 || "",
      task2Note: legacy.task2 || "",
      task3Note: legacy.task3 || "",
      activityDetail: legacy.activityDetail || "",
      specialNote: legacy.specialNote || "",
      restraint: legacy.wheelchairRestraint || "",
      recorder: legacy.recorder || base.front.recorder,
    },
    back: {
      ...base.back,
      seizureNote: legacy.seizures || "",
      otherNote: legacy.otherMessage || legacy.hydrationNote || "",
    },
  }
}

export default async function CaseRecordsPage({ params, searchParams }: PageProps) {
  const { serviceId } = params
  const userId = decodeURIComponent(params.userId)
  const dateStr = searchParams?.date || format(new Date(), "yyyy-MM-dd")
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
    serviceName: serviceId,
  }
  const baseContent = getDefaultATCaseRecordContent(dateStr, headerDefaults)
  const existingRow = await fetchStructuredCaseRecord(userId, serviceId, dateStr).catch(() => null)
  const persistedContent = existingRow?.content?.template === template ? existingRow.content.data : null
  const initialContent: ATCaseRecordContent = normalizeContent(persistedContent, baseContent)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <CaseRecordHistory userId={userId} serviceId={serviceId} activeDate={dateStr} />
      <CaseRecordClient
        userId={userId}
        serviceId={serviceId}
        date={dateStr}
        userName={detail.name}
        profile={profile}
        initialContent={initialContent}
      />
    </div>
  )
}
