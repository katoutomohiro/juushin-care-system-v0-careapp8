import { NextRequest, NextResponse } from "next/server"
import {
  fetchUserServiceDefaults,
  normalizeServiceUserDefaults,
  upsertUserServiceDefaults,
} from "@/lib/service-users"

type RouteContext = {
  params: { userId: string }
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { userId } = context.params
  const decodedUserId = decodeURIComponent(userId)

  try {
    const defaults = await fetchUserServiceDefaults(decodedUserId)
    const normalized = defaults ? normalizeServiceUserDefaults(defaults) : null

    return NextResponse.json({
      ok: true,
      defaults: normalized,
      data: normalized,
    })
  } catch (error) {
    console.error("[service-users/defaults][GET]", error)
    const message = error instanceof Error ? error.message : "Failed to fetch service user defaults"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { userId } = context.params
  const decodedUserId = decodeURIComponent(userId)

  try {
    const body = await req.json()
    const updated = await upsertUserServiceDefaults(decodedUserId, body)
    return NextResponse.json({ ok: true, data: updated }, { status: 200 })
  } catch (error) {
    console.error("[service-users/defaults][POST]", error)
    const message = error instanceof Error ? error.message : "Failed to upsert service user defaults"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
