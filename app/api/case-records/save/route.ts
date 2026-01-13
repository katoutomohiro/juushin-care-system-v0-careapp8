import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseAdminEnv } from "@/lib/supabase/serverAdmin"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"

export const runtime = "nodejs"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getSupabaseProjectInfo(url: string) {
  if (!url) return { host: "", projectRef: "" }
  try {
    const host = new URL(url).host
    const projectRef = host.split(".")[0] || ""
    return { host, projectRef }
  } catch {
    return { host: "", projectRef: "" }
  }
}

function normalizeDate(input: unknown): string | null {
  if (!input) return null
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null
    return input.toISOString().slice(0, 10)
  }

  if (typeof input === "string") {
    const trimmed = input.trim()
    const slashMatch = /^(\d{4})[./-](\d{2})[./-](\d{2})$/.exec(trimmed)
    if (slashMatch) {
      const [, year, month, day] = slashMatch
      return `${year}-${month}-${day}`
    }
    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }

  if (typeof input === "number") {
    const parsed = new Date(input)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const urlPrefix = supabaseAdminEnv.url ? `${supabaseAdminEnv.url.slice(0, 8)}...` : ""
    const { host, projectRef } = getSupabaseProjectInfo(supabaseAdminEnv.url)
    console.info("[case-records/save POST] supabase env", {
      urlPrefix,
      host,
      projectRef,
      urlSource: supabaseAdminEnv.urlSource,
      keySource: supabaseAdminEnv.keySource,
      branch: supabaseAdminEnv.branch,
    })

    if (!supabaseAdmin || supabaseAdminEnv.branch !== "server") {
      const missingKeys =
        supabaseAdminEnv.missingKeys.length > 0 ? supabaseAdminEnv.missingKeys : ["Supabase env not resolved"]
      return NextResponse.json(
        {
          ok: false,
          where: "case-records/save POST",
          error: "Supabase client not initialized",
          detail: `Missing required env for Supabase service_role client: ${missingKeys.join(", ")}`,
          env: {
            urlSource: supabaseAdminEnv.urlSource,
            keySource: supabaseAdminEnv.keySource,
            branch: supabaseAdminEnv.branch,
          },
        },
        { status: 500 },
      )
    }

    const body = await req.json().catch(() => null)
    const bodyKeys = body && typeof body === "object" ? Object.keys(body) : []
    const serviceInput = body?.serviceId ?? body?.service_id ?? body?.serviceSlug ?? body?.service ?? null
    const record = body?.record ?? null
    const recordDataInput = body?.recordData ?? body?.record_data ?? record ?? null
    const careReceiverCodeInput = body?.userId ?? body?.user_id ?? null
    const recordDateRaw = body?.date ?? body?.recordDate ?? body?.record_date ?? null
    const recordTimeRaw = body?.recordTime ?? body?.record_time ?? null

    const recordDate = normalizeDate(recordDateRaw)
    const recordTime = recordTimeRaw == null ? null : String(recordTimeRaw)

    // Handle record_data: convert from string if needed, preserve structured format
    let recordData: any
    if (typeof recordDataInput === "string") {
      try {
        recordData = JSON.parse(recordDataInput)
      } catch {
        recordData = {}
      }
    } else if (recordDataInput && typeof recordDataInput === "object" && !Array.isArray(recordDataInput)) {
      recordData = { ...(recordDataInput as Record<string, unknown>) }
    } else {
      recordData = {}
    }

    const careReceiverCode = normalizeUserId(careReceiverCodeInput == null ? "" : String(careReceiverCodeInput))
    if (process.env.NODE_ENV === "development") {
      console.info("[case-records/save POST] request", {
        serviceInput,
        careReceiverCode,
        recordDate,
        recordTime,
        recordDataVersion: recordData?.version,
      })
    }

    const missingFields: string[] = []
    if (!serviceInput) missingFields.push("serviceId")
    if (!careReceiverCodeInput) missingFields.push("userId")
    if (!recordDate) missingFields.push("recordDate")

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
          where: "case-records/save POST",
          payloadKeys: bodyKeys,
        },
        { status: 400 },
      )
    }

    let serviceId: string | null = null
    if (uuidRegex.test(serviceInput)) {
      serviceId = serviceInput
    } else {
      console.info("[case-records/save POST] service lookup", { serviceSlug: serviceInput })
      const { data: serviceData, error: serviceError } = await supabaseAdmin
        .from("services")
        .select("id")
        .eq("slug", serviceInput)
        .maybeSingle()

      if (serviceError) {
        console.error("[case-records/save POST] service lookup failed", {
          serviceSlug: serviceInput,
          message: serviceError.message,
          code: serviceError.code,
          details: serviceError.details,
          hint: serviceError.hint,
        })
        return NextResponse.json(
          {
            ok: false,
            error: "Service lookup failed",
            detail: serviceError.message || "Unknown error",
            where: "case-records/save POST",
            payloadKeys: bodyKeys,
          },
          { status: 400 },
        )
      }

      if (!serviceData?.id) {
        return NextResponse.json(
          {
            ok: false,
            error: "Service slug not found",
            detail: `No rows for services.slug='${serviceInput}'. Check Supabase project ref or seed data.`,
            where: "case-records/save POST",
            payloadKeys: bodyKeys,
          },
          { status: 404 },
        )
      }

      serviceId = serviceData.id
    }

    if (!careReceiverCode) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid userId",
          detail: "Could not normalize care receiver code from userId.",
          where: "case-records/save POST",
          payloadKeys: bodyKeys,
        },
        { status: 400 },
      )
    }

    const { data: careReceiver, error: careReceiverError } = await supabaseAdmin
      .from("care_receivers")
      .select("id, code")
      .eq("code", careReceiverCode)
      .maybeSingle()

    if (careReceiverError) {
      console.error("[case-records/save POST] care receiver lookup failed", {
        code: careReceiverCode,
        message: careReceiverError.message,
        details: careReceiverError.details,
        hint: careReceiverError.hint,
      })
      return NextResponse.json(
        {
          ok: false,
          error: "care_receiver lookup failed",
          detail: careReceiverError.message || "Unknown error",
          where: "case-records/save POST",
          payloadKeys: bodyKeys,
        },
        { status: 400 },
      )
    }

    if (!careReceiver?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "care_receiver not found",
          detail: `No rows for care_receivers.code='${careReceiverCode}'.`,
          where: "case-records/save POST",
          payloadKeys: bodyKeys,
        },
        { status: 404 },
      )
    }

    const recordRow = {
      service_id: serviceId,
      care_receiver_id: careReceiver.id,
      user_id: null,
      record_date: recordDate,
      record_time: recordTime ?? null,
      record_data: recordData,
    }

    const { data, error } = await supabaseAdmin
      .from("case_records")
      .insert([recordRow])
      .select("*")
      .single()

    if (error) {
      console.error("[case-records/save POST] failed", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        payload: recordRow,
      })
      return NextResponse.json(
        {
          ok: false,
          error: error.message || "Supabase insert failed",
          detail: error.details ?? error.hint ?? `Supabase insert failed: ${error.code ?? "unknown"}`,
          where: "case-records/save POST",
          payloadKeys: Object.keys(recordRow),
        },
        { status: 400 },
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
