import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseAdminEnv } from "@/lib/supabase/serverAdmin"

export const runtime = "nodejs"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ResolvedId = {
  id: string | null
  source?: string
  attempts: string[]
}

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

async function resolveUserId(rawUserId: string) {
  const attempts: string[] = []
  if (uuidRegex.test(rawUserId)) {
    return { id: rawUserId, source: "direct", attempts } as ResolvedId
  }

  const candidates = [
    { table: "users", column: "internal_user_id" },
    { table: "users", column: "code" },
    { table: "users", column: "slug" },
    { table: "users", column: "name" },
    { table: "profiles", column: "internal_user_id" },
    { table: "profiles", column: "code" },
    { table: "profiles", column: "slug" },
    { table: "care_receivers", column: "code" },
    { table: "care_receivers", column: "slug" },
  ]

  for (const candidate of candidates) {
    const label = `${candidate.table}.${candidate.column}`
    attempts.push(label)
    const { data, error } = await supabaseAdmin!
      .from(candidate.table)
      .select("id")
      .eq(candidate.column, rawUserId)
      .maybeSingle()

    if (error) {
      console.warn("[case-records/save POST] user lookup failed", {
        candidate: label,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      continue
    }

    if (data?.id) {
      return { id: data.id, source: label, attempts } as ResolvedId
    }
  }

  return { id: null, attempts } as ResolvedId
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

    if (!supabaseAdmin) {
      const missingKeys =
        supabaseAdminEnv.missingKeys.length > 0 ? supabaseAdminEnv.missingKeys : ["Supabase env not resolved"]
      return NextResponse.json(
        {
          ok: false,
          where: "case-records/save POST",
          error: "Supabase client not initialized",
          detail: `Missing required env for Supabase client: ${missingKeys.join(", ")}`,
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
    const userId = record?.userId ?? record?.user_id ?? body?.userId ?? body?.user_id ?? null
    const recordDateRaw = record?.date ?? body?.date ?? body?.recordDate ?? body?.record_date ?? null
    const recordTimeRaw =
      record?.meta?.recordTime ??
      record?.recordTime ??
      recordDataInput?.meta?.recordTime ??
      body?.recordTime ??
      body?.record_time ??
      null

    const recordDate = normalizeDate(recordDateRaw)
    const recordTime = recordTimeRaw == null ? null : String(recordTimeRaw)
    const recordData =
      recordDataInput && typeof recordDataInput === "object" && !Array.isArray(recordDataInput)
        ? { ...(recordDataInput as Record<string, unknown>) }
        : {}

    for (const key of [
      "serviceId",
      "service_id",
      "serviceSlug",
      "service",
      "userId",
      "user_id",
      "date",
      "recordDate",
      "record_date",
      "recordTime",
      "record_time",
    ]) {
      if (key in recordData) delete recordData[key]
    }

    const recordDataKeys = Object.keys(recordData)
    console.info("[case-records/save POST] request", {
      serviceInput,
      userId,
      recordDateRaw,
      recordDate,
      recordTime,
      recordDataKeys,
      recordDataType: typeof recordDataInput,
      bodyKeys,
    })

    const missingFields: string[] = []
    if (!serviceInput) missingFields.push("serviceId")
    if (!userId) missingFields.push("userId")
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
          { status: 400 },
        )
      }

      serviceId = serviceData.id
    }

    const resolvedUser = await resolveUserId(String(userId))
    console.info("[case-records/save POST] resolved ids", {
      serviceInput,
      serviceId,
      userInput: userId,
      userId: resolvedUser.id,
      userSource: resolvedUser.source,
    })

    if (!resolvedUser.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "userId not found",
          detail: `Could not resolve '${userId}'. Checked: ${resolvedUser.attempts.join(", ")}`,
          where: "case-records/save POST",
          payloadKeys: bodyKeys,
        },
        { status: 400 },
      )
    }

    const recordRow = {
      service_id: serviceId,
      user_id: resolvedUser.id,
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
