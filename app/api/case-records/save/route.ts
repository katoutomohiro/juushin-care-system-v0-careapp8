import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    const ALLOW_MISSING_SERVICE_ID = process.env.ALLOW_MISSING_SERVICE_ID === "true"

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      const missingKeys: string[] = []
      if (!SUPABASE_URL) missingKeys.push("NEXT_PUBLIC_SUPABASE_URL")
      if (!SERVICE_ROLE) missingKeys.push("SUPABASE_SERVICE_ROLE_KEY")

      const urlSample = SUPABASE_URL ? `${SUPABASE_URL.slice(0, 20)}...` : ""
      return NextResponse.json(
        {
          ok: false,
          where: "env",
          missingKeys,
          got: {
            urlPresent: !!SUPABASE_URL,
            keyPresent: !!SERVICE_ROLE,
            urlSample,
          },
        },
        { status: 500 },
      )
    }

    const body = await req.json().catch(() => null)
    const serviceSlug = body?.serviceId ?? body?.serviceSlug ?? body?.service ?? null
    const record = body?.record ?? null
    const recordData = body?.recordData ?? body?.record_data ?? null
    const userId = record?.userId ?? body?.userId ?? null
    const recordDate = record?.date ?? body?.date ?? body?.recordDate ?? body?.record_date ?? null
    const recordTime =
      record?.meta?.recordTime ??
      record?.recordTime ??
      recordData?.meta?.recordTime ??
      body?.recordTime ??
      body?.record_time ??
      null

    const missingFields: string[] = []
    if (!serviceSlug) missingFields.push("serviceId")
    if (!userId) missingFields.push("userId")
    if (!recordDate) missingFields.push("recordDate")

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
          where: "case-records/save POST",
        },
        { status: 400 },
      )
    }

    let serviceId: string | null = serviceSlug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      serviceSlug,
    )
    if (!isUuid) {
      const { data: serviceData, error: serviceError } = await supabaseAdmin
        .from("services")
        .select("id")
        .eq("slug", serviceSlug)
        .maybeSingle()

      if (serviceError || !serviceData?.id) {
        console.warn("[case-records/save POST] service lookup failed", {
          serviceSlug,
          message: serviceError?.message,
          code: serviceError?.code,
        })
        serviceId = null
      } else {
        serviceId = serviceData.id
      }
    }

    const payloadData = { ...(recordData ?? record ?? {}) } as Record<string, unknown>
    if (!serviceId && serviceSlug) {
      payloadData.serviceSlug = serviceSlug
    }

    if (!serviceId && !ALLOW_MISSING_SERVICE_ID) {
      return NextResponse.json(
        {
          ok: false,
          error: "\u30b5\u30fc\u30d3\u30b9ID\u304c\u53d6\u5f97\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f",
          detail: "services \u30c6\u30fc\u30d6\u30eb\u304c\u5b58\u5728\u3057\u306a\u3044\u304b\u8a72\u5f53\u30ec\u30b3\u30fc\u30c9\u304c\u3042\u308a\u307e\u305b\u3093",
          where: "case-records/save POST",
        },
        { status: 400 },
      )
    }

    const recordRow = {
      service_id: serviceId,
      user_id: userId,
      record_date: recordDate,
      record_time: recordTime ?? null,
      record_data: payloadData,
    }

    const { data, error } = await supabaseAdmin
      .from("case_records")
      .upsert(recordRow, {
        onConflict: "service_id,user_id,record_date",
      })
      .select()
      .single()

    if (error) {
      console.error("[case-records/save POST] failed", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        {
          ok: false,
          error: error.message || "Supabase upsert failed",
          detail: error.details ?? error.hint ?? `Supabase upsert failed: ${error.code ?? "unknown"}`,
          where: "case-records/save POST",
        },
        { status: 500 },
      )
    }

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: "No data returned from database",
          where: "case-records/save POST",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        ok: true,
        record: data,
      },
      { status: 200 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[case-records/save POST] failed", { message })
    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected error occurred",
        message,
        where: "case-records/save POST",
      },
      { status: 500 },
    )
  }
}
