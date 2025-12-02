import { NextResponse, type NextRequest } from "next/server"
import { listStaffMembers } from "@/lib/staff"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get("limit")
  const parsedLimit = limitParam ? Number(limitParam) : null
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(50, parsedLimit)) : 10

  try {
    const staff = await listStaffMembers({ activeOnly: true, limit })
    const safeStaff = staff || []
    return NextResponse.json({ ok: true, staff: safeStaff, data: safeStaff })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch staff members"
    console.error("[staff/active][GET] error", error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
