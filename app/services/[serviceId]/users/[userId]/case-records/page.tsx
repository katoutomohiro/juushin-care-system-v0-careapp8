import { format } from "date-fns"
import { userDetails } from "@/lib/user-master-data"
import { buildUserProfileFromUserDetail } from "@/types/user-profile"
import {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8 sm:px-6 lg:px-8">
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
