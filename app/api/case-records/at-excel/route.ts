import { NextResponse } from "next/server"
import {
  AT_STRUCTURED_TEMPLATE,
  normalizeATCaseRecordContent,
  saveATCaseRecord,
  type ATCaseRecordContent,
} from "@/lib/at-excel-case-records"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, serviceType, recordDate, content } = body as {
      userId?: string
      serviceType?: string
      recordDate?: string
      content?: ATCaseRecordContent
    }
    if (!userId || !serviceType || !recordDate || !content) {
      return NextResponse.json({ error: "userId, serviceType, recordDate, content は必須です" }, { status: 400 })
    }
    if (!content.header?.staffId) {
      return NextResponse.json({ error: "担当者を選択してください" }, { status: 400 })
    }

    const normalized = normalizeATCaseRecordContent(content, {
      recordDate,
      serviceType: "life-care",
      serviceTimeSlot: content.header.serviceTimeSlot,
      staffId: content.header.staffId,
    })

    if (normalized.header.serviceType !== serviceType) {
      normalized.header.serviceType = serviceType as any
    }

    const row = await saveATCaseRecord({
      userId,
      serviceType,
      recordDate,
      content: normalized,
    })
    return NextResponse.json({
      ok: true,
      template: AT_STRUCTURED_TEMPLATE,
      content: row?.content?.data ?? normalized,
    })
  } catch (e: any) {
    console.error("[api/case-records/at-excel] error", e)
    return NextResponse.json({ error: e?.message || "保存に失敗しました" }, { status: 500 })
  }
}
