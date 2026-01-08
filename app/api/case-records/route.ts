import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export async function POST(req: NextRequest) {
  try {
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

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[case-records POST] Configuration error: missing Supabase environment variables")
      return NextResponse.json(
        {
          ok: false,
          error: "Server configuration error",
          detail: "Missing Supabase environment variables",
          where: "case-records POST",
        },
        { status: 500 }
      )
    }

    // Prepare record data with exact column names matching DB schema
    const recordData = {
      service_id: serviceId,    // Ensure snake_case to match DB columns
      user_id: userId,          // Ensure snake_case to match DB columns
      record_date: recordDate,  // Ensure snake_case to match DB columns
      record_time: recordTime || null,
      payload: {
        ...payload,
        mainStaffId,
        subStaffIds,
      },
    }

    console.log("[case-records POST] Inserting record:", {
      service_id: serviceId,
      user_id: userId,
      record_date: recordDate,
      payloadKeys: payload ? Object.keys(payload) : [],
    })

    // Insert to Supabase without conflict handling for debugging
    const { data, error } = await supabaseAdmin
      .from("case_records")
      .insert(recordData)
      .select()
      .single()

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
          detail: `Supabase insert failed: ${error.code}`,
          where: "case-records POST",
        },
        { status: 500 }
      )
    }

    if (!data) {
      console.error("[case-records POST] failed: no data returned from insert", {
        userId,
        serviceId,
        recordDate,
      })
      return NextResponse.json(
        {
          ok: false,
          error: "No data returned from database",
          detail: "Insert completed but returned empty result",
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

