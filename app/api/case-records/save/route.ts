import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

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
        { status: 200 },
      )
    }

    const body = await req.json().catch(() => null)
    const serviceSlug = body?.serviceId
    const record = body?.record
    const userId = record?.userId
    const recordDate = record?.date

    if (!serviceSlug || !userId || !recordDate) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing required fields: serviceId, record.userId, record.date",
          where: "case-records/save POST",
        },
        { status: 400 },
      )
    }

    let serviceId = serviceSlug
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
        console.error("[case-records/save POST] service lookup failed", {
          serviceSlug,
          message: serviceError?.message,
          code: serviceError?.code,
        })
        return NextResponse.json(
          {
            ok: false,
            error: "サービスID取得に失敗しました",
            detail: serviceError?.message ?? "Service not found",
            where: "case-records/save POST",
          },
          { status: 400 },
        )
      }
      serviceId = serviceData.id
    }

    const recordData = {
      service_id: serviceId,
      user_id: userId,
      record_date: recordDate,
      record_data: record,
    }

    const { data, error } = await supabaseAdmin
      .from("case_records")
      .upsert(recordData, {
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
          error: error.message,
          detail: `Supabase upsert failed: ${error.code}`,
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
