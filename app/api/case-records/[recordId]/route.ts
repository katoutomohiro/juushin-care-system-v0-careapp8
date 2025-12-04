import { NextResponse, type NextRequest } from "next/server"
import { getCaseRecord, updateCaseRecord } from "@/lib/case-records-structured"

type RouteParams = { params: { recordId: string } }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const record = await getCaseRecord(params.recordId)
    if (!record) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: record })
  } catch (error) {
    console.error("[case-records/:id][GET]", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch case record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const record = await updateCaseRecord(params.recordId, {
      recordDate: body.recordDate ?? undefined,
      startTime: body.startTime ?? undefined,
      endTime: body.endTime ?? undefined,
      category: body.category ?? undefined,
      summary: body.summary ?? undefined,
      details: body.details ?? undefined,
      createdBy: body.createdBy ?? undefined,
    })
    return NextResponse.json({ ok: true, data: record })
  } catch (error) {
    console.error("[case-records/:id][PUT]", error)
    return NextResponse.json({ ok: false, error: "Failed to update case record" }, { status: 500 })
  }
}
