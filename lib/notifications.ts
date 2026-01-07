import { db, type PushSubscriptionRecord } from "./db"

const DEFAULT_ICON = "/icon-192.png"
const DEFAULT_BADGE = "/badge-96.png"
const DEFAULT_TAG = "care-app-alert"
const DEFAULT_USER_ID = "default"

/**
 * Legacy helper - prefer ensurePermission for on-demand prompts.
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("[requestPermission] Notification API not available")
    return "denied"
  }

  if (Notification.permission !== "default") {
    return Notification.permission
  }

  return await Notification.requestPermission()
}

/**
 * Ask for notification permission only when required.
 */
export async function ensurePermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("[ensurePermission] Notification API not available")
    return false
  }

  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false

  const permission = await Notification.requestPermission().catch((error) => {
    console.warn("[ensurePermission] requestPermission failed:", error)
    return "denied"
  })

  return permission === "granted"
}

/**
 * Register the service worker used for notifications.
 * Disabled by default in production to prevent stale cache issues.
 * Can be enabled via NEXT_PUBLIC_ENABLE_SW=true in development/staging.
 */
export async function registerServiceWorker(): Promise<void> {
  // Respect explicit disable flag
  if (process.env.NEXT_PUBLIC_DISABLE_SW === 'true') {
    console.log("[registerServiceWorker] disabled via NEXT_PUBLIC_DISABLE_SW")
    return
  }

  // Production: disable SW by default unless explicitly enabled
  if (typeof window !== "undefined" && process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_ENABLE_SW !== 'true') {
      console.log("[registerServiceWorker] disabled in production (set NEXT_PUBLIC_ENABLE_SW=true to enable)")
      return
    }
  }

  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("[registerServiceWorker] Service Worker not supported")
    return
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    console.log("[registerServiceWorker] registered:", registration.scope)
  } catch (error) {
    console.warn("[registerServiceWorker] failed:", error)
  }
}

const NOTIFICATION_WINDOW_MS = 5 * 60 * 1000

type NotificationHistory = {
  time: number
  levelPriority: number
}

const notificationSentHistory = new Map<string, NotificationHistory>()
const LEVEL_PRIORITY: Record<string, number> = { critical: 3, warn: 2, info: 1 }

function resolveLevelPriority(level?: string): number {
  if (!level) return 0
  return LEVEL_PRIORITY[level] ?? 0
}

export type LocalNotificationOptions = {
  title: string
  body?: string
  url: string
  type: string
  date: string
  userId?: string
  level?: string
  data?: Record<string, unknown>
}

/**
 * Show a local notification via Service Worker (fallbacks to toast).
 */
export async function notifyLocal(opts: LocalNotificationOptions): Promise<void> {
  const {
    title,
    body = "",
    url,
    type,
    date,
    userId = DEFAULT_USER_ID,
    data,
  } = opts

  const key = `${type}:${date}:${userId}`
  const now = Date.now()
  const currentPriority = resolveLevelPriority(opts.level)
  const previous = notificationSentHistory.get(key)

  if (previous && now - previous.time < NOTIFICATION_WINDOW_MS && currentPriority <= previous.levelPriority) {
    return
  }

  notificationSentHistory.set(key, { time: now, levelPriority: currentPriority })

  const payload = {
    ...(data ?? {}),
    url,
    type,
    date,
    userId,
    level: opts.level,
  }

  const canNotify =
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted" &&
    "serviceWorker" in navigator

  if (canNotify) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        body,
        icon: DEFAULT_ICON,
        badge: DEFAULT_BADGE,
        tag: DEFAULT_TAG,
        data: payload,
        requireInteraction: false,
      })
      return
    } catch (error) {
      console.warn("[notifyLocal] showNotification failed, fallback to toast:", error)
    }
  }

  try {
    const { toast } = await import("sonner")
    toast(`${title}${body ? ` - ${body}` : ""}`)
  } catch {
    console.log("[notifyLocal] fallback:", title, body)
  }
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = typeof atob === "function" ? atob(base64) : ""
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i)
  }
  return output.buffer
}

async function upsertSubscriptionRecord(userId: string, subscription: PushSubscription): Promise<void> {
  const json = subscription.toJSON()
  const record: PushSubscriptionRecord = {
    id: subscription.endpoint,
    userId,
    endpoint: subscription.endpoint,
    keys: json.keys,
    expirationTime: subscription.expirationTime ?? null,
    createdAt: Date.now(),
    raw: json,
  }
  await db.pushSubscriptions.put(record)
}

export async function getStoredSubscription(userId: string = DEFAULT_USER_ID): Promise<PushSubscriptionRecord | undefined> {
  return await db.pushSubscriptions.where("userId").equals(userId).first()
}

export async function subscribePush(userId: string = DEFAULT_USER_ID): Promise<PushSubscription | null> {
  if (typeof window === "undefined") return null
  const supportsPush = ("serviceWorker" in navigator) && ("PushManager" in window)
  if (!supportsPush) {
    console.warn("[subscribePush] Push API not supported")
    return null
  }

  const permitted = await ensurePermission()
  if (!permitted) {
    console.warn("[subscribePush] Notification permission denied")
    return null
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    console.warn("[subscribePush] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set")
    return null
  }

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    await upsertSubscriptionRecord(userId, existing)
    return existing
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToArrayBuffer(vapidKey),
    })
    await upsertSubscriptionRecord(userId, subscription)
    return subscription
  } catch (error) {
    console.warn("[subscribePush] subscribe failed:", error)
    return null
  }
}

export async function unsubscribePush(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return false

    const endpoint = subscription.endpoint
    const success = await subscription.unsubscribe()
    if (success) {
      await db.pushSubscriptions.where("id").equals(endpoint).delete()
    }
    return success
  } catch (error) {
    console.warn("[unsubscribePush] unsubscribe failed:", error)
    return false
  }
}
