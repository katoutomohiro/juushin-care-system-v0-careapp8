import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseAdminEnv } from "@/lib/supabase/serverAdmin"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"
import { 
  requireApiUser, 
  unauthorizedResponse,
  unexpectedErrorResponse,
  ensureSupabaseAdmin,
  isValidUUID,
  supabaseErrorResponse,
  missingFieldsResponse,
  jsonError
} from "@/lib/api/route-helpers"

export const runtime = "nodejs"

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
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

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

    const missingKeys = supabaseAdminEnv.missingKeys.length > 0 ? supabaseAdminEnv.missingKeys : ["Supabase env not resolved"]
    const clientError = ensureSupabaseAdmin(
      supabaseAdmin,
      `Missing required env for Supabase service_role client: ${missingKeys.join(", ")}`
    )
    if (clientError) {
      return clientError
    }

    const body = await req.json().catch(() => null)
    const bodyKeys = body && typeof body === "object" ? Object.keys(body) : []
    const serviceInput = body?.serviceId ?? body?.service_id ?? body?.serviceSlug ?? body?.service ?? null
    const careReceiverIdInput = body?.careReceiverId ?? body?.care_receiver_id ?? null
    const record = body?.record ?? null
    const recordDataInput = body?.recordData ?? body?.record_data ?? record ?? null
    const careReceiverCodeInput = body?.userId ?? body?.user_id ?? null
    const recordDateRaw = body?.date ?? body?.recordDate ?? body?.record_date ?? null
    const recordTimeRaw = body?.recordTime ?? body?.record_time ?? null
    const mainStaffId = body?.mainStaffId ?? body?.main_staff_id ?? null
    const subStaffId = body?.subStaffId ?? body?.sub_staff_id ?? null
    const recordId = body?.id ?? body?.recordId ?? null
    const version = body?.version ?? null  // 🔐 Optimistic locking version

    const recordDate = normalizeDate(recordDateRaw)
    const recordTime = recordTimeRaw == null ? null : String(recordTimeRaw)
    
    // Handle record_data: convert from string if needed, preserve structured format
    // 
    // 📋 FUTURE DESIGN NOTE (cf. docs/RECORDS_API_DESIGN_EVOLUTION.md):
    // Currently record_data is freeform JSON (any shape).
    // For future analytics/AI integration, consider:
    //   - Add event_type + occurred_at to all events (seizure, excretion, vitals, nutrition, sleep)
    //   - Use ISO 8601 timestamps for all time fields
    //   - Nest time-series events in record_data.events[] array
    //   - Add recorded_by_staff_id + recorded_at for audit trail
    //   - Validate with Zod schema (RecordDataV2) in migration phase
    //
    // Current validation is minimal; consider adding:
    //   if (record_data.events) {
    //     validateEventTimestamps(record_data.events)  // All in ISO 8601?
    //     validateEventOrdering(record_data.events)    // Sorted by occurred_at?
    //   }
    //
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
    if (!careReceiverIdInput && !careReceiverCodeInput) missingFields.push("careReceiverId or userId")
    if (!recordDate) missingFields.push("recordDate")
    if (!mainStaffId) missingFields.push("mainStaffId")

    if (missingFields.length > 0) {
      return missingFieldsResponse(missingFields)
    }

    // Ensure mainStaffId and subStaffId are UUID or null (never other formats like "staff-1")
    let normalizedMainStaffId: string | null = null
    let normalizedSubStaffId: string | null = null

    if (mainStaffId && isValidUUID(String(mainStaffId))) {
      normalizedMainStaffId = String(mainStaffId)
    }

    if (subStaffId && isValidUUID(String(subStaffId))) {
      normalizedSubStaffId = String(subStaffId)
    }

    let careReceiverId: string | null = null
    if (careReceiverIdInput && isValidUUID(String(careReceiverIdInput))) {
      careReceiverId = String(careReceiverIdInput)
    }

    let serviceId: string | null = null
    if (isValidUUID(serviceInput)) {
      serviceId = serviceInput
    } else {
      console.info("[case-records/save POST] service lookup", { serviceSlug: serviceInput })
      const { data: serviceData, error: serviceError } = await supabaseAdmin!
        .from("services")
        .select("id")
        .eq("slug", serviceInput)
        .maybeSingle()

      if (serviceError) {
        return supabaseErrorResponse('case-records/save POST (service lookup)', serviceError, {
          serviceSlug: serviceInput,
          payloadKeys: bodyKeys,
        })
      }

      if (!serviceData?.id) {
        return jsonError("Service slug not found", 404, {
          ok: false,
          detail: `No rows for services.slug='${serviceInput}'. Check Supabase project ref or seed data.`,
          extra: {
            where: "case-records/save POST",
            payloadKeys: bodyKeys,
          },
        })
      }

      serviceId = serviceData.id
    }

    if (!careReceiverId && !careReceiverCode) {
      return jsonError("Invalid care receiver", 400, {
        ok: false,
        detail: "Could not resolve care receiver id or code.",
        extra: {
          where: "case-records/save POST",
          payloadKeys: bodyKeys,
        },
      })
    }

    let careReceiver = null
    if (careReceiverId) {
      const { data, error: careReceiverIdError } = await supabaseAdmin!
        .from("care_receivers")
        .select("id, code")
        .eq("id", careReceiverId)
        .maybeSingle()
      if (careReceiverIdError) {
        return supabaseErrorResponse('case-records/save POST (care receiver lookup by id)', careReceiverIdError, {
          id: careReceiverId,
          payloadKeys: bodyKeys,
        })
      }
      careReceiver = data
    } else {
      const { data, error: careReceiverError } = await supabaseAdmin!
        .from("care_receivers")
        .select("id, code")
        .eq("code", careReceiverCode)
        .maybeSingle()

      if (careReceiverError) {
        return supabaseErrorResponse('case-records/save POST (care receiver lookup by code)', careReceiverError, {
          code: careReceiverCode,
          payloadKeys: bodyKeys,
        })
      }

      careReceiver = data
    }

    if (!careReceiver?.id) {
      return jsonError("care_receiver not found", 404, {
        ok: false,
        detail: `No rows for care_receivers.code='${careReceiverCode}'.`,
        extra: {
          where: "case-records/save POST",
          payloadKeys: bodyKeys,
        },
      })
    }

    // Ensure recordData.sections.staff is synchronized with DB UUIDs
    if (!recordData.sections) {
      recordData.sections = {}
    }
    recordData.sections.staff = {
      mainStaffId: normalizedMainStaffId,
      subStaffIds: normalizedSubStaffId ? [normalizedSubStaffId] : [],
    }

    const recordRow = {
      service_id: serviceId,
      care_receiver_id: careReceiver.id,
      user_id: null,
      record_date: recordDate,
      record_time: recordTime ?? null,
      record_data: recordData,
      main_staff_id: normalizedMainStaffId,
      sub_staff_id: normalizedSubStaffId ?? null,
    }

    let data: any = null
    let error: any = null

    if (recordId && isValidUUID(String(recordId))) {
      // 既存レコードの更新
      let updateQuery = supabaseAdmin!
        .from("case_records")
        .update(recordRow)
        .eq("id", recordId)
      
      // 🔐 楽観的ロック: version が指定されている場合のみチェック
      if (version !== null && version !== undefined) {
        updateQuery = updateQuery.eq("version", version)
      }
      
      const updateResult = await updateQuery
        .select("*")
        .maybeSingle()
      
      data = updateResult.data
      error = updateResult.error
      
      // 🔐 競合検知: version 指定時に 0 件更新なら 409 Conflict
      if (version !== null && version !== undefined && !data && !error) {
        return jsonError("conflict", 409, {
          ok: false,
          detail: `Expected version ${version} but record was modified by another user.`,
          extra: {
            message: "他の端末でこのケース記録が更新されています。最新の内容を確認してから、再度編集してください。",
            where: "case-records/save POST",
          },
        })
      }
    } else {
      const insertResult = await supabaseAdmin!
        .from("case_records")
        .insert([recordRow])
        .select("*")
        .single()
      data = insertResult.data
      error = insertResult.error
    }

    if (error) {
      return supabaseErrorResponse('case-records/save POST (final save)', error, {
        payload: recordRow,
        recordId,
        payloadKeys: Object.keys(recordRow),
      })
    }

    if (!data) {
      return jsonError("No data returned from database", 500, {
        ok: false,
        extra: { where: "case-records/save POST" },
      })
    }

    return NextResponse.json(
      {
        ok: true,
        record: data,
      },
      { status: 200 },
    )
  } catch (error) {
    return unexpectedErrorResponse('case-records/save POST', error)
  }
}
