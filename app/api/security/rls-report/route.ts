import { NextResponse } from "next/server"
import { scanRlsMigrations } from "@/scripts/rls_migration_scan"

export const runtime = "nodejs"

export async function GET() {
  try {
    const result = await scanRlsMigrations()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[rls-report] Failed to scan migrations:", error)
    return NextResponse.json(
      { ok: false, error: "rls_report_failed" },
      { status: 500 }
    )
  }
}
