import { NextRequest, NextResponse } from "next/server"
import {
  requireApiUser,
  unauthorizedResponse,
  jsonError,
  ensureSupabaseAdmin,
} from "@/lib/api/route-helpers"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import type { RecordsAnalyticsResponse } from "@/src/types/recordsAnalytics"

export const runtime = "nodejs"

type ParsedParams = {
  dateFrom: string
  dateTo: string
  careReceiverId: string | null
  serviceId: string | null
}

type DailyData = {
  seizureCount: number
  sleepMins: number
  mealsCompleted: number
}

type DailyEntry = DailyData & { date: string }

type CaseRecordRow = {
  record_date: string
  record_data: Record<string, unknown> | null
}

type SupabaseAdminClient = NonNullable<typeof supabaseAdmin>

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const resolveDateRange = (
  dateFromParam: string | null,
  dateToParam: string | null
): { dateFrom: string; dateTo: string } => {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return {
    dateFrom: dateFromParam || formatDate(sevenDaysAgo),
    dateTo: dateToParam || formatDate(today),
  }
}

const parseParams = (req: NextRequest): ParsedParams => {
  const { searchParams } = new URL(req.url)
  const dateFromParam = searchParams.get("dateFrom")
  const dateToParam = searchParams.get("dateTo")
  const careReceiverId = searchParams.get("careReceiverId")
  const serviceId = searchParams.get("serviceId")

  const { dateFrom, dateTo } = resolveDateRange(dateFromParam, dateToParam)

  return {
    dateFrom,
    dateTo,
    careReceiverId,
    serviceId,
  }
}

const logParamsIfDev = (params: ParsedParams) => {
  if (process.env.NODE_ENV === "development") {
    console.info("[case-records/analytics GET]", {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      careReceiverId: params.careReceiverId,
      serviceId: params.serviceId,
    })
  }
}

const buildQuery = (client: SupabaseAdminClient, params: ParsedParams) => {
  let query = client
    .from("case_records")
    .select("record_date, record_data")
    .gte("record_date", params.dateFrom)
    .lte("record_date", params.dateTo)

  if (params.careReceiverId) {
    query = query.eq("care_receiver_id", params.careReceiverId)
  }

  if (params.serviceId) {
    query = query.eq("service_id", params.serviceId)
  }

  return query
}

const fetchRecords = async (query: ReturnType<typeof buildQuery>) => {
  const { data, error } = await query

  if (error) {
    console.error("[case-records/analytics GET] DB error:", error)
    return {
      records: null as CaseRecordRow[] | null,
      errorResponse: jsonError("Failed to query records from database", 500, {
        ok: false,
        detail: error.message,
      }),
    }
  }

  return {
    records: (data ?? null) as CaseRecordRow[] | null,
    errorResponse: null as Response | null,
  }
}

const initDailyMap = (dateFrom: string, dateTo: string) => {
  const dailyMap = new Map<string, DailyData>()
  const currentDate = new Date(dateFrom)
  const endDate = new Date(dateTo)
  endDate.setDate(endDate.getDate() + 1)

  while (currentDate < endDate) {
    const dateStr = formatDate(currentDate)
    dailyMap.set(dateStr, {
      seizureCount: 0,
      sleepMins: 0,
      mealsCompleted: 0,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dailyMap
}

const addDailyDefaults = (dailyMap: Map<string, DailyData>, dateStr: string) => {
  if (!dailyMap.has(dateStr)) {
    dailyMap.set(dateStr, {
      seizureCount: 0,
      sleepMins: 0,
      mealsCompleted: 0,
    })
  }
}

const aggregateRecords = (
  records: CaseRecordRow[] | null,
  dailyMap: Map<string, DailyData>
) => {
  if (!records || records.length === 0) {
    return
  }

  for (const record of records) {
    const dateStr = record.record_date
    addDailyDefaults(dailyMap, dateStr)

    const dayData = dailyMap.get(dateStr)
    if (!dayData) {
      continue
    }

    const recordData = record.record_data
    if (!recordData || typeof recordData !== "object") {
      continue
    }

    if (typeof recordData.seizure_count === "number") {
      dayData.seizureCount += recordData.seizure_count
    }

    if (typeof recordData.sleep_minutes === "number") {
      dayData.sleepMins += recordData.sleep_minutes
    }

    if (typeof recordData.meals_completed === "number") {
      dayData.mealsCompleted += recordData.meals_completed
    }
  }
}

const buildDailyArray = (dailyMap: Map<string, DailyData>): DailyEntry[] =>
  Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

const buildSummary = (daily: DailyEntry[]) => {
  const seizureCountTotal = daily.reduce((sum, d) => sum + d.seizureCount, 0)
  const sleepMinsList = daily.map(d => d.sleepMins).filter(m => m > 0)
  const sleepMinsAvg =
    sleepMinsList.length > 0
      ? Math.round(
          sleepMinsList.reduce((sum, m) => sum + m, 0) / sleepMinsList.length
        )
      : 0
  const mealsCompletedTotal = daily.reduce((sum, d) => sum + d.mealsCompleted, 0)

  return {
    seizureCountTotal,
    sleepMinsAvg,
    mealsCompletedTotal,
  }
}

const okJson = <T,>(data: T) =>
  NextResponse.json(
    {
      ok: true,
      data,
    },
    { status: 200 }
  )

/**
 * GET /api/case-records/analytics
 *
 * Query params:
 *   - dateFrom: YYYY-MM-DD (optional, default: 7 days ago)
 *   - dateTo: YYYY-MM-DD (optional, default: today)
 *   - careReceiverId: uuid (optional, filter by care receiver)
 *   - serviceId: uuid (optional, filter by service)
 *
 * Returns daily aggregates and summary statistics for records analysis.
 * Currently returns mock data structure; database integration planned.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    // Validate Supabase admin client
    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return clientError
    }

    // TypeScript assertion after validation
    if (!supabaseAdmin) {
      return jsonError("Supabase admin client not initialized", 500)
    }

    const params = parseParams(req)
    logParamsIfDev(params)

    // TODO: Database query to aggregated case_records
    // - Query case_records for given date range
    // - Filter by careReceiverId and/or serviceId if provided
    // - Extract time-series events from record_data.events[] (when implemented)
    // - Calculate daily aggregates:
    //     * seizureCount from events where event_type = 'seizure'
    //     * sleepMins from events where event_type = 'sleep' (sum of duration_min)
    //     * mealsCompleted from events where event_type = 'nutrition' with high intake_rate
    // - Compute summary stats from daily arrays

    // Query case_records from Supabase
    const query = buildQuery(supabaseAdmin, params)
    const { records, errorResponse } = await fetchRecords(query)
    if (errorResponse) {
      return errorResponse
    }

    const dailyMap = initDailyMap(params.dateFrom, params.dateTo)
    aggregateRecords(records, dailyMap)

    const daily = buildDailyArray(dailyMap)
    const summary = buildSummary(daily)

    const responseData = {
      range: {
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      },
      daily,
      summary,
    } satisfies RecordsAnalyticsResponse

    return okJson(responseData)
  } catch (error) {
    console.error("[case-records/analytics GET] error:", error)
    return jsonError(
      "Failed to retrieve analytics",
      500,
      {
        ok: false,
        detail: error instanceof Error ? error.message : "Unknown error",
      }
    )
  }
}
