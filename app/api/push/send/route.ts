import { NextRequest, NextResponse } from "next/server"
import webpush from "web-push"
import { VAPID_CONTACT, VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from "@/lib/env"

export const runtime = "nodejs"

const hasVapidConfig = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)

if (hasVapidConfig) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export async function POST(req: NextRequest) {
  if (!hasVapidConfig) {
    return NextResponse.json(
      { error: "VAPID keys are not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY." },
      { status: 500 },
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const { subscription, payload } = body ?? {}
  if (!subscription || !subscription.endpoint) {
    return NextResponse.json({ error: "Missing push subscription" }, { status: 400 })
  }

  const notificationPayload = payload ?? {
    title: "Care App テスト通知",
    body: "push/send からのテスト通知です",
    data: { url: "/alerts" },
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[push/send] sendNotification failed:", error)
    return NextResponse.json(
      { error: "Failed to dispatch push notification", details: error?.message },
      { status: 502 },
    )
  }
}
