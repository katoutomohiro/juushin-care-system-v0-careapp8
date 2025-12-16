import { NextResponse, type NextRequest } from "next/server"
import { createCaseRecord, listCaseRecords } from "@/lib/case-records-structured"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const limit = searchParams.get("limit")
  const serviceType = searchParams.get("serviceType")

  if (!userId) {
    return NextResponse.json({ ok: false, error: "userId is required" }, { status: 400 })
  }

  try {
    const records = await listCaseRecords(
      {
        userId,
        serviceType: serviceType || undefined,
        limit: limit ? Number(limit) : undefined,
      },
      undefined,
    )
    return NextResponse.json({ ok: true, data: records })
  } catch (error) {
    console.error("[case-records][GET] Error details:", {
      userId,
      serviceType,
      limit,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch case records",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, serviceType, recordDate } = body || {}
    if (!userId || !serviceType || !recordDate) {
      return NextResponse.json({ ok: false, error: "userId, serviceType and recordDate are required" }, { status: 400 })
    }

    const record = await createCaseRecord({
      userId,
      serviceType,
      recordDate,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      category: body.category ?? "daily",
      summary: body.summary ?? "",
      details: body.details ?? null,
      createdBy: body.createdBy ?? null,
    })

    return NextResponse.json({ ok: true, data: record }, { status: 200 })
  } catch (error) {
    console.error("[case-records][POST] Error details:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create case record",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
