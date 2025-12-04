import { NextResponse, type NextRequest } from "next/server"
import { ACTIVE_STAFF_DEFAULT_LIMIT, fetchActiveStaff } from "@/lib/staff"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get("limit")
  const parsedLimit = limitParam !== null ? Number(limitParam) : ACTIVE_STAFF_DEFAULT_LIMIT
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : ACTIVE_STAFF_DEFAULT_LIMIT

  try {
    const staff = await fetchActiveStaff(limit)
    return NextResponse.json({ ok: true, staff, data: staff })
  } catch (error) {
    console.error("[staff/active][GET]", error)
    const message = error instanceof Error ? error.message : "Failed to fetch staff members"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
