import { format } from "date-fns"
import { AT_SERVICE_TIME_OPTIONS, AT_STAFF_FALLBACK_OPTIONS, SERVICE_LABELS } from "@/lib/case-record-constants"
import {
  buildDefaultATExcelCaseRecordContent,
  loadATExcelCaseRecord,
  normalizeATExcelCaseRecordContent,
  type ATCaseRecordContent,
} from "@/lib/at-excel-case-records"
import { userDetails } from "@/lib/user-master-data"
import { listStaffMembers } from "@/lib/staff"
import type { StaffMember } from "@/lib/staff"
import { fetchUserServiceDefaults, normalizeServiceUserDefaults } from "@/lib/service-users"
import ATExcelCaseRecordClient from "./excel-case-record-client"

type PageProps = {
  params: Promise<{ serviceId: string; userId: string }>
  searchParams?: Promise<{ date?: string }>
}

export default async function ATExcelCaseRecordPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const serviceId = resolvedParams.serviceId
  const userId = decodeURIComponent(resolvedParams.userId)
  const dateStr = resolvedSearchParams?.date || format(new Date(), "yyyy-MM-dd")

  const detail = userDetails[userId]
  let serviceUserDefaults: Awaited<ReturnType<typeof fetchUserServiceDefaults>> = null
  try {
    serviceUserDefaults = await fetchUserServiceDefaults(userId)
  } catch (e) {
    console.error("[ATExcelCaseRecordPage] service user defaults load failed", e)
  }
  const normalizedServiceUser = serviceUserDefaults
    ? normalizeServiceUserDefaults(serviceUserDefaults, { userId, name: detail?.name, serviceType: serviceId })
    : null
  const userDisplayName = detail?.name || normalizedServiceUser?.name || userId
  const staffOptions: StaffMember[] = await listStaffMembers({ activeOnly: true }).catch(() => [])
  const staffChoices = staffOptions.length
    ? staffOptions
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "ja"))
        .slice(0, 10)
        .map((s) => ({ id: s.id, name: s.name }))
    : AT_STAFF_FALLBACK_OPTIONS.slice(0, 10)
  const defaultStaffId = staffChoices[0]?.id || "staff-unknown"
  const defaultTimeSlot = AT_SERVICE_TIME_OPTIONS[0] || ""

  let existing: ATCaseRecordContent | null = null
  try {
    existing = await loadATExcelCaseRecord({ userId, serviceType: serviceId, recordDate: dateStr })
  } catch (e) {
    console.error("[ATExcelCaseRecordPage] load failed", e)
  }

  const fallbackParams = {
    recordDate: dateStr,
    serviceType: serviceId as "life-care",
    serviceTimeSlot: defaultTimeSlot,
    staffId: defaultStaffId,
    userName: userDisplayName,
  }

  let initialContent = normalizeATExcelCaseRecordContent(
    existing ||
      buildDefaultATExcelCaseRecordContent({
        recordDate: dateStr,
        serviceType: serviceId as "life-care",
        serviceTimeSlot: defaultTimeSlot,
        staffId: defaultStaffId,
        userName: userDisplayName,
      }),
    fallbackParams,
  )

  if (!existing && normalizedServiceUser) {
    const header = initialContent.header
    header.mainStaffId = header.mainStaffId ?? normalizedServiceUser.defaultMainStaffId ?? null
    header.subStaffId = header.subStaffId ?? normalizedServiceUser.defaultSubStaffIds?.[0] ?? null
    header.serviceTime = {
      start: header.serviceTime?.start ?? normalizedServiceUser.defaultServiceStartTime ?? null,
      end: header.serviceTime?.end ?? normalizedServiceUser.defaultServiceEndTime ?? null,
    }
    header.totalServiceTimeSlot =
      header.totalServiceTimeSlot ?? (normalizedServiceUser.defaultTotalServiceMinutes ?? null)?.toString?.() ?? null
    header.daytimeSupportMorningStart =
      header.daytimeSupportMorningStart ?? normalizedServiceUser.defaultDayServiceAmStartTime ?? null
    header.daytimeSupportMorningEnd =
      header.daytimeSupportMorningEnd ?? normalizedServiceUser.defaultDayServiceAmEndTime ?? null
    header.daytimeSupportAfternoonStart =
      header.daytimeSupportAfternoonStart ?? normalizedServiceUser.defaultDayServicePmStartTime ?? null
    header.daytimeSupportAfternoonEnd =
      header.daytimeSupportAfternoonEnd ?? normalizedServiceUser.defaultDayServicePmEndTime ?? null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm text-muted-foreground">
              <a className="underline" href={`/services/${serviceId}/users/${encodeURIComponent(userId)}`}>
                ← {detail?.name || userId} の詳細へ戻る
              </a>
            </div>
            <h1 className="text-2xl font-bold mt-1">A・T様　生活介護ケース記録（Excel手入力版）</h1>
            <p className="text-sm text-muted-foreground mt-1">サービス: {SERVICE_LABELS[serviceId] || serviceId}</p>
          </div>
          <div className="rounded-full border px-3 py-1 text-sm text-muted-foreground">記録日: {dateStr}</div>
        </div>

        <ATExcelCaseRecordClient
          userId={userId}
          serviceId={serviceId}
          recordDate={dateStr}
          initialContent={initialContent}
          staffOptions={staffChoices}
          userDisplayName={userDisplayName}
          serviceTimeOptions={AT_SERVICE_TIME_OPTIONS}
        />
      </div>
    </div>
  )
}
