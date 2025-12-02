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

    return NextResponse.json({
      ok: true,
      defaults: defaults ? normalizeServiceUserDefaults(defaults) : null,
    })
  } catch (error) {
    console.error("[service-users/defaults][GET] error", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { userId } = context.params
  const decodedUserId = decodeURIComponent(userId)

  try {
    const body = await req.json()
    const defaults = body?.defaults
    if (!defaults) {
      return NextResponse.json({ ok: false, error: "defaults payload is required" }, { status: 400 })
    }

    await upsertUserServiceDefaults(decodedUserId, defaults)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[service-users/defaults][POST] error", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
