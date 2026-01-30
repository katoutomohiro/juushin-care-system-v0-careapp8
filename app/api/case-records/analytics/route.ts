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

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const dateFromParam = searchParams.get("dateFrom")
    const dateToParam = searchParams.get("dateTo")
    const careReceiverId = searchParams.get("careReceiverId")
    const serviceId = searchParams.get("serviceId")

    // Calculate default dates (today - 7 days to today)
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const dateFrom = dateFromParam || formatDate(sevenDaysAgo)
    const dateTo = dateToParam || formatDate(today)

    if (process.env.NODE_ENV === "development") {
      console.info("[case-records/analytics GET]", {
        dateFrom,
        dateTo,
        careReceiverId,
        serviceId,
      })
    }

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
    let query = supabaseAdmin
      .from("case_records")
      .select("record_date, record_data")
      .gte("record_date", dateFrom)
      .lte("record_date", dateTo)

    if (careReceiverId) {
      query = query.eq("care_receiver_id", careReceiverId)
    }

    if (serviceId) {
      query = query.eq("service_id", serviceId)
    }

    const { data: records, error: dbError } = await query

    if (dbError) {
      console.error("[case-records/analytics GET] DB error:", dbError)
      return jsonError(
        "Failed to query records from database",
        500,
        {
          ok: false,
          detail: dbError.message,
        }
      )
    }

    // Initialize daily map (ensure all dates have entries)
    const dailyMap = new Map<
      string,
      { seizureCount: number; sleepMins: number; mealsCompleted: number }
    >()

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

    // Aggregate data from records
    if (records && records.length > 0) {
      for (const record of records) {
        const dateStr = record.record_date

        if (!dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, {
            seizureCount: 0,
            sleepMins: 0,
            mealsCompleted: 0,
          })
        }

        const dayData = dailyMap.get(dateStr)!

        // Extract events from record_data
        const recordData = record.record_data as Record<string, unknown>
        if (recordData && typeof recordData === "object") {
          // Count seizure events
          if (recordData.seizure_count && typeof recordData.seizure_count === "number") {
            dayData.seizureCount += recordData.seizure_count
          }

          // Sum sleep minutes
          if (recordData.sleep_minutes && typeof recordData.sleep_minutes === "number") {
            dayData.sleepMins += recordData.sleep_minutes
          }

          // Count meal completions
          if (recordData.meals_completed && typeof recordData.meals_completed === "number") {
            dayData.mealsCompleted += recordData.meals_completed
          }
        }
      }
    }

    // Convert map to sorted daily array
    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate summary statistics from daily data
    const seizureCountTotal = daily.reduce((sum, d) => sum + d.seizureCount, 0)
    const sleepMinsList = daily.map(d => d.sleepMins).filter(m => m > 0)
    const sleepMinsAvg = sleepMinsList.length > 0
      ? Math.round(sleepMinsList.reduce((sum, m) => sum + m, 0) / sleepMinsList.length)
      : 0
    const mealsCompletedTotal = daily.reduce((sum, d) => sum + d.mealsCompleted, 0)

    const responseData = {
      range: {
        dateFrom,
        dateTo,
      },
      daily,
      summary: {
        seizureCountTotal,
        sleepMinsAvg,
        mealsCompletedTotal,
      },
    } satisfies RecordsAnalyticsResponse

    return NextResponse.json(
      {
        ok: true,
        data: responseData,
      },
      { status: 200 }
    )
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
