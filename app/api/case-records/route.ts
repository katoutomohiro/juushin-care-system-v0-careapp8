import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    // Env presence check (return 200 with diagnostics, not 500)
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
        { status: 200 }
      )
    }

    // Env URL basic validation before using Supabase client
    const urlSample = `${SUPABASE_URL.slice(0, 20)}...`
    if (!SUPABASE_URL.startsWith("https://") || !SUPABASE_URL.includes("supabase.co")) {
      return NextResponse.json(
        {
          ok: false,
          where: "env_url_invalid",
          urlSample,
        },
        { status: 200 }
      )
    }

    const body = await req.json()
    const { userId, serviceId, recordDate, recordTime, mainStaffId, subStaffIds, payload } = body

    // Validate required fields
    if (!userId || !serviceId || !recordDate) {
      console.error("[case-records POST] Validation error: missing required fields", {
        hasUserId: !!userId,
        hasServiceId: !!serviceId,
        hasRecordDate: !!recordDate,
      })
      return NextResponse.json(
        {
          ok: false,
          error: "Missing required fields: userId, serviceId, recordDate",
          detail: "Validation failed",
          where: "case-records POST",
        },
        { status: 400 }
      )
    }

    // Prepare record data with exact column names matching DB schema
    // DB columns: service_id, user_id, record_date, payload ONLY
    const recordData = {
      service_id: serviceId,
      user_id: userId,
      record_date: recordDate,
      payload: {
        ...payload,
        recordTime,           // Move record_time into payload
        mainStaffId,
        subStaffIds,
      },
    }

    console.log("[case-records POST] Upserting record:", {
      service_id: serviceId,
      user_id: userId,
      record_date: recordDate,
      payloadKeys: payload ? Object.keys(payload) : [],
    })

    // Upsert to Supabase with explicit conflict columns (service_id, user_id, record_date)
    let data, error
    try {
      const result = await supabaseAdmin
        .from("case_records")
        .upsert(recordData, {
          onConflict: "service_id,user_id,record_date",
        })
        .select()
        .single()
      data = result.data
      error = result.error
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      const cause = e && typeof e === "object" && "cause" in e ? (e as any).cause : undefined
      return NextResponse.json(
        {
          ok: false,
          where: message.includes("fetch failed") ? "supabase_fetch_failed" : "supabase_upsert_throw",
          message,
          cause,
        },
        { status: 200 }
      )
    }

    if (error) {
      console.error("[case-records POST] failed", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
        serviceId,
        recordDate,
        payloadKeys: payload ? Object.keys(payload) : [],
      })
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          detail: `Supabase upsert failed: ${error.code}`,
          where: "case-records POST",
        },
        { status: 500 }
      )
    }

    if (!data) {
      console.error("[case-records POST] failed: no data returned from upsert", {
        userId,
        serviceId,
        recordDate,
      })
      return NextResponse.json(
        {
          ok: false,
          error: "No data returned from database",
          detail: "Upsert completed but returned empty result",
          where: "case-records POST",
        },
        { status: 500 }
      )
    }

    console.log("[case-records POST] success", {
      recordId: data.id,
      userId,
      serviceId,
      recordDate,
    })

    return NextResponse.json(
      {
        ok: true,
        recordId: data.id,
        record: data,
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error && error.stack ? error.stack : ""
    // Truncate stack to first 200 chars for production logging
    const truncatedStack = errorStack.substring(0, 200)
    
    console.error("[case-records POST] failed", {
      message: errorMsg,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error,
    })
    
    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected error occurred",
        message: errorMsg,
        stack: truncatedStack,
        where: "route.ts:POST",
      },
      { status: 500 }
    )
  }
}

