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

    // Prepare record data
    const recordData = {
      user_id: userId,
      service_id: serviceId,
      record_date: recordDate,
      record_time: recordTime || null,
      payload: {
        ...payload,
        mainStaffId,
        subStaffIds,
      },
    }

    console.log("[case-records POST] Upserting record:", {
      user_id: userId,
      service_id: serviceId,
      record_date: recordDate,
      payloadKeys: payload ? Object.keys(payload) : [],
    })

    // Upsert to Supabase (unique constraint: service_id, user_id, record_date)
    const { data, error } = await supabaseAdmin
      .from("case_records")
      .upsert(recordData, {
        onConflict: "service_id,user_id,record_date",
      })
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
    const errorStack = error instanceof Error ? error.stack : ""
    
    console.error("[case-records POST] failed", {
      message: errorMsg,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error,
    })
    
    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected error occurred",
        detail: errorMsg,
        where: "case-records POST",
      },
      { status: 500 }
    )
  }
}

