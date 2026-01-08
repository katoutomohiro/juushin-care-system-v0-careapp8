import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, serviceId, recordDate, recordTime, mainStaffId, subStaffIds, payload } = body

    // Validate required fields
    if (!userId || !serviceId || !recordDate) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing required fields: userId, serviceId, recordDate",
        },
        { status: 400 }
      )
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[case-records API] Missing Supabase environment variables")
      return NextResponse.json(
        {
          ok: false,
          error: "Server configuration error",
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

    console.log("[case-records API] Upserting record:", {
      user_id: userId,
      service_id: serviceId,
      record_date: recordDate,
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
      console.error("[case-records API] Supabase error:", error)
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      )
    }

    console.log("[case-records API] Success:", data)

    return NextResponse.json(
      {
        ok: true,
        record: data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[case-records API] Unexpected error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
