import { NextResponse, type NextRequest } from "next/server"
import { ACTIVE_STAFF_DEFAULT_LIMIT, fetchActiveStaff } from "@/lib/staff"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get("limit")
  const parsedLimit = limitParam !== null ? Number(limitParam) : ACTIVE_STAFF_DEFAULT_LIMIT
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : ACTIVE_STAFF_DEFAULT_LIMIT

  // Fail-safe: env check to avoid undici fetch failed → return 200 with empty list
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim()
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  if (!supabaseUrl || !serviceRole) {
    console.error("[staff/active] Missing Supabase env", {
      SUPABASE_URL_PRESENT: Boolean(supabaseUrl),
      SUPABASE_SERVICE_ROLE_KEY_PRESENT: Boolean(serviceRole),
    })
    return NextResponse.json(
      { ok: true, staff: [], data: [], warning: "MISSING_SUPABASE_ENV" },
      { status: 200 },
    )
  }

  try {
    const staff = await fetchActiveStaff(limit)
    return NextResponse.json({ ok: true, staff, data: staff })
  } catch (error) {
    console.error("[staff/active][GET]", error, (error as any)?.cause)
    const message = error instanceof Error ? error.message : "Failed to fetch staff members"
    // Degrade gracefully to avoid 500 spam in console
    return NextResponse.json(
      { ok: true, staff: [], data: [], error: message },
      { status: 200 },
    )
  }
}
