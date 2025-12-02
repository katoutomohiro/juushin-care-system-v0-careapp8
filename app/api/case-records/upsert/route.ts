import { NextResponse } from "next/server"
import {
  buildATCaseRecordContentFromDailyLog,
  resolveCaseRecordTemplate,
  upsertCaseRecordContent,
  upsertCaseRecordFromDailyLog,
  type ATCaseRecordContent,
} from "@/lib/case-records"
import { userDetails } from "@/lib/user-master-data"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, serviceType, recordDate, dailyLog, careEvents, content, template, source } = body

    if (!userId || !serviceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const detail = userDetails[userId]
    if (!detail) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const targetDate = recordDate || new Date().toISOString().slice(0, 10)
    const headerOverrides = {
      userName: detail.name,
      age: detail.age ? String(detail.age) : "",
      sex: detail.gender || "",
      serviceName: serviceType,
    }

    const resolvedTemplate = template || resolveCaseRecordTemplate(userId)
    const resolvedContent =
      content ||
      buildATCaseRecordContentFromDailyLog({
        recordDate: targetDate,
        dailyLog,
        careEvents,
        userId,
        serviceType,
        headerOverrides,
      })

    const row =
      source === "manual" || content
        ? await upsertCaseRecordContent({
            userId,
            serviceType,
            recordDate: targetDate,
            content: resolvedContent as ATCaseRecordContent,
            template: resolvedTemplate,
            source: source || "manual",
          })
        : await upsertCaseRecordFromDailyLog(userId, serviceType, targetDate, dailyLog, careEvents, headerOverrides)

    return NextResponse.json({ ok: true, content: row.content })
  } catch (e: any) {
    const errorInfo = {
      message: e?.message || "Server error",
      code: e?.code,
      details: e?.details,
      hint: e?.hint,
    }
    console.error("[case-records/upsert] error", errorInfo)
    return NextResponse.json(
      {
        error: errorInfo.message,
        details: {
          code: errorInfo.code,
          hint: errorInfo.hint,
          detail: errorInfo.details,
        },
      },
      { status: e?.status || 500 },
    )
  }
}
