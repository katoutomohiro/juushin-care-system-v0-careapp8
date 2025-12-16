import { NextRequest, NextResponse } from "next/server"
import {
  fetchUserServiceDefaults,
  normalizeServiceUserDefaults,
  upsertUserServiceDefaults,
} from "@/lib/service-users"

type RouteContext = {
  params: Promise<{ userId: string }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const params = await context.params
  const { userId } = params
  const decodedUserId = decodeURIComponent(userId)

  // Fail-safe: env check
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim()
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  if (!supabaseUrl || !serviceRole) {
    console.error("[service-users/defaults][GET] Missing Supabase env", {
      SUPABASE_URL_PRESENT: Boolean(supabaseUrl),
      SUPABASE_SERVICE_ROLE_KEY_PRESENT: Boolean(serviceRole),
    })
    return NextResponse.json({ ok: true, defaults: null, data: null, warning: "MISSING_SUPABASE_ENV" }, { status: 200 })
  }

  try {
    const defaults = await fetchUserServiceDefaults(decodedUserId)
    const normalized = defaults ? normalizeServiceUserDefaults(defaults) : null

    return NextResponse.json({
      ok: true,
      defaults: normalized,
      data: normalized,
    })
  } catch (error) {
    console.error("[service-users/defaults][GET]", error, (error as any)?.cause)
    const message = error instanceof Error ? error.message : "Failed to fetch service user defaults"
    // Degrade gracefully to avoid 500 spam
    return NextResponse.json({ ok: true, defaults: null, data: null, error: message }, { status: 200 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const params = await context.params
  const { userId } = params
  const decodedUserId = decodeURIComponent(userId)

  // Fail-safe: env check
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim()
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  if (!supabaseUrl || !serviceRole) {
    console.error("[service-users/defaults][POST] Missing Supabase env", {
      SUPABASE_URL_PRESENT: Boolean(supabaseUrl),
      SUPABASE_SERVICE_ROLE_KEY_PRESENT: Boolean(serviceRole),
    })
    return NextResponse.json({ ok: false, error: "MISSING_SUPABASE_ENV" }, { status: 200 })
  }

  try {
    const body = await req.json()
    const updated = await upsertUserServiceDefaults(decodedUserId, body)
    return NextResponse.json({ ok: true, data: updated }, { status: 200 })
  } catch (error) {
    console.error("[service-users/defaults][POST]", error, (error as any)?.cause)
    const message = error instanceof Error ? error.message : "Failed to upsert service user defaults"
    // return 200 to avoid frontend 500 spam
    return NextResponse.json({ ok: false, error: message }, { status: 200 })
  }
}
