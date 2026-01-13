import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseAdminEnv } from "@/lib/supabase/serverAdmin"
// UUID専用エンドポイントに修正（slug/codeの解決を排除）

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    // Validate Supabase admin client
    if (!supabaseAdmin || supabaseAdminEnv.branch !== "server") {
      const missingKeys =
        supabaseAdminEnv.missingKeys.length > 0 ? supabaseAdminEnv.missingKeys : ["Supabase env not resolved"]
      return NextResponse.json(
        {
          ok: false,
          error: "Supabase client not initialized",
          detail: `Missing required env for Supabase service_role client: ${missingKeys.join(", ")}`,
          where: "case-records GET",
        },
        { status: 500 },
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId") || null
    const careReceiverId = searchParams.get("careReceiverId") || null
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const limitStr = searchParams.get("limit") || "20"
    const offsetStr = searchParams.get("offset") || "0"

    const limit = Math.min(Math.max(parseInt(limitStr) || 20, 1), 100) // 1-100
    const offset = Math.max(parseInt(offsetStr) || 0, 0)

    if (process.env.NODE_ENV === "development") {
      console.info("[case-records GET] Query params", {
        serviceId,
        careReceiverId,
        dateFrom,
        dateTo,
        limit,
        offset,
      })
    }

    // Validate required parameters
    const missingFields: string[] = []
    if (!serviceId) missingFields.push("serviceId")
    if (!careReceiverId) missingFields.push("careReceiverId")

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing required query parameters",
          detail: `Required: serviceId (UUID) and careReceiverId (UUID). Missing: ${missingFields.join(", ")}`,
          where: "case-records GET",
        },
        { status: 400 },
      )
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    // Validate UUIDs
    if (!serviceId || !uuidRegex.test(serviceId)) {
      return NextResponse.json(
        { ok: false, error: "serviceId must be UUID", where: "case-records GET" },
        { status: 400 },
      )
    }
    if (!careReceiverId || !uuidRegex.test(careReceiverId)) {
      return NextResponse.json(
        { ok: false, error: "careReceiverId must be UUID", where: "case-records GET" },
        { status: 400 },
      )
    }

    // Build query
    let query = supabaseAdmin
      .from("case_records")
      .select("id, service_id, care_receiver_id, record_date, record_time, record_data, created_at", { count: "exact" })
      .eq("service_id", serviceId)
      .eq("care_receiver_id", careReceiverId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Optional date filters
    if (dateFrom) {
      query = query.gte("record_date", dateFrom)
    }
    if (dateTo) {
      query = query.lte("record_date", dateTo)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("[case-records GET] fetch failed", {
        message: error.message,
        code: error.code,
        details: error.details,
      })
      return NextResponse.json(
        {
          ok: false,
          error: error.message || "Supabase query failed",
          detail: error.details ?? error.hint ?? `Query failed: ${error.code ?? "unknown"}`,
          where: "case-records GET",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        ok: true,
        records: data || [],
        pagination: {
          limit,
          offset,
          count: count ?? (data?.length ?? 0),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[case-records GET] failed", { message })
    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected error occurred",
        message,
        where: "case-records GET",
      },
      { status: 500 },
    )
  }
}
