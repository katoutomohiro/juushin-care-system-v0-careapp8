import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/case-records/list
 * Query params:
 *   - serviceId: uuid (required)
 *   - careReceiverId: uuid (required)
 *   - dateFrom: YYYY-MM-DD (optional)
 *   - dateTo: YYYY-MM-DD (optional)
 *   - mainStaffId: uuid (optional, filter by main staff)
 *   - limit: number (default: 50)
 *   - offset: number (default: 0)
 *
 * Client公開API：認証必須 + RLS自動適用 + anon key使用
 * 設計判断：
 * - createRouteHandlerClient(cookies) でセッション自動バインド
 * - RLS で service_id フィルタリング自動適用
 */
export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId")
    const careReceiverId = searchParams.get("careReceiverId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const dateExact = searchParams.get("date")
    const mainStaffId = searchParams.get("mainStaffId")
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    // Validation
    if (!serviceId || !careReceiverId) {
      return NextResponse.json(
        {
          error: "serviceId and careReceiverId are required",
        },
        { status: 400 }
      )
    }

    // Build query
    let query = supabaseAdmin
      .from("case_records")
      .select(
        `
        id,
        service_id,
        care_receiver_id,
        record_date,
        record_time,
        record_data,
        main_staff_id,
        sub_staff_id,
        main_staff:staff!case_records_main_staff_fk ( id, name ),
        sub_staff:staff!case_records_sub_staff_fk ( id, name ),
        created_at,
        updated_at
      `,
        { count: "exact" }
      )
      .eq("service_id", serviceId)
      .eq("care_receiver_id", careReceiverId)
      .order("record_date", { ascending: false })
      .order("id", { ascending: false })

    // Date range filter
    if (dateExact) {
      query = query.gte("record_date", dateExact).lte("record_date", dateExact)
    } else {
      if (dateFrom) {
        query = query.gte("record_date", dateFrom)
      }
      if (dateTo) {
        query = query.lte("record_date", dateTo)
      }
    }

    // Main staff filter
    if (mainStaffId) {
      query = query.eq("main_staff_id", mainStaffId)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("[GET /api/case-records/list] Supabase error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch case records",
          detail: error.message,
        },
        { status: 500 }
      )
    }

    // Transform response to include staff names
    const records = (data || []).map((record: any) => ({
      id: record.id,
      serviceId: record.service_id,
      careReceiverId: record.care_receiver_id,
      recordDate: record.record_date,
      recordTime: record.record_time,
      mainStaffId: record.main_staff_id,
      mainStaffName: record.main_staff?.name || null,
      subStaffIds: record.sub_staff_id ? [record.sub_staff_id] : [],
      subStaffId: record.sub_staff_id,
      subStaffName: record.sub_staff?.name || null,
      recordData: record.record_data,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }))

    return NextResponse.json({
      ok: true,
      records,
      pagination: {
        total: count,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("[GET /api/case-records/list] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
