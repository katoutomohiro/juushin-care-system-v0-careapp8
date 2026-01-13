import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseAdminEnv } from "@/lib/supabase/serverAdmin"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"

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
    const serviceSlug = searchParams.get("serviceSlug")?.trim() || null
    const serviceSlugOrId = serviceSlug || searchParams.get("serviceId") || null
    const careReceiverIdInput = searchParams.get("careReceiverId") || searchParams.get("userId") || null
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const limitStr = searchParams.get("limit") || "20"
    const offsetStr = searchParams.get("offset") || "0"

    const limit = Math.min(Math.max(parseInt(limitStr) || 20, 1), 100) // 1-100
    const offset = Math.max(parseInt(offsetStr) || 0, 0)

    console.info("[case-records GET] Query params", {
      serviceSlug,
      serviceSlugOrId,
      careReceiverIdInput,
      dateFrom,
      dateTo,
      limit,
      offset,
    })

    // Validate required parameters
    const missingFields: string[] = []
    if (!serviceSlugOrId) missingFields.push("serviceSlug")
    if (!careReceiverIdInput) missingFields.push("careReceiverId (userId is accepted and mapped internally)")

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing required query parameters",
          detail: `Required: serviceSlug and careReceiverId. userId is accepted and mapped to careReceiverId. Missing: ${missingFields.join(", ")}`,
          where: "case-records GET",
        },
        { status: 400 },
      )
    }

    // Resolve service ID from slug if needed
    let serviceId: string | null = null
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (serviceSlugOrId && uuidRegex.test(serviceSlugOrId)) {
      serviceId = serviceSlugOrId
    } else {
      const { data: serviceData, error: serviceError } = await supabaseAdmin
        .from("services")
        .select("id")
        .eq("slug", serviceSlugOrId)
        .maybeSingle()

      if (serviceError) {
        console.error("[case-records GET] service lookup failed", {
          serviceSlug: serviceSlugOrId,
          message: serviceError.message,
        })
        return NextResponse.json(
          {
            ok: false,
            error: "Service lookup failed",
            detail: serviceError.message || "Unknown error",
            where: "case-records GET",
          },
          { status: 400 },
        )
      }

      if (!serviceData?.id) {
        return NextResponse.json(
          {
            ok: false,
            error: "Service not found",
            detail: `No service with slug='${serviceSlugOrId}'`,
            where: "case-records GET",
          },
          { status: 404 },
        )
      }

      serviceId = serviceData.id
    }

    // Resolve care receiver UUID (accepts UUID directly, or code -> UUID)
    const isUuidCareReceiverInput = !!careReceiverIdInput && uuidRegex.test(careReceiverIdInput)
    let careReceiverId: string | null = null

    if (isUuidCareReceiverInput) {
      const { data: careReceiverById, error: careReceiverByIdError } = await supabaseAdmin
        .from("care_receivers")
        .select("id, code")
        .eq("id", careReceiverIdInput)
        .maybeSingle()

      if (careReceiverByIdError) {
        console.error("[case-records GET] care receiver lookup by id failed", {
          id: careReceiverIdInput,
          message: careReceiverByIdError.message,
        })
        return NextResponse.json(
          {
            ok: false,
            error: "care_receiver lookup failed",
            detail: careReceiverByIdError.message || "Unknown error",
            where: "case-records GET",
          },
          { status: 400 },
        )
      }

      if (!careReceiverById?.id) {
        return NextResponse.json(
          {
            ok: false,
            error: "care_receiver not found",
            detail: `No care_receiver with id='${careReceiverIdInput}'`,
            where: "case-records GET",
          },
          { status: 404 },
        )
      }

      careReceiverId = careReceiverById.id
    } else {
      const careReceiverCode = normalizeUserId(careReceiverIdInput)
      if (!careReceiverCode) {
        return NextResponse.json(
          {
            ok: false,
            error: "Invalid careReceiverId",
            detail: "Could not normalize care receiver code from careReceiverId.",
            where: "case-records GET",
          },
          { status: 400 },
        )
      }

      const { data: careReceiverByCode, error: careReceiverByCodeError } = await supabaseAdmin
        .from("care_receivers")
        .select("id, code")
        .eq("code", careReceiverCode)
        .maybeSingle()

      if (careReceiverByCodeError) {
        console.error("[case-records GET] care receiver lookup failed", {
          code: careReceiverCode,
          message: careReceiverByCodeError.message,
        })
        return NextResponse.json(
          {
            ok: false,
            error: "care_receiver lookup failed",
            detail: careReceiverByCodeError.message || "Unknown error",
            where: "case-records GET",
          },
          { status: 400 },
        )
      }

      if (!careReceiverByCode?.id) {
        return NextResponse.json(
          {
            ok: false,
            error: "care_receiver not found",
            detail: `No care_receiver with code='${careReceiverCode}'`,
            where: "case-records GET",
          },
          { status: 404 },
        )
      }

      careReceiverId = careReceiverByCode.id
    }

    // Build query
    let query = supabaseAdmin
      .from("case_records")
      .select("id, service_id, care_receiver_id, record_date, record_time, created_at, updated_at", { count: "exact" })
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
