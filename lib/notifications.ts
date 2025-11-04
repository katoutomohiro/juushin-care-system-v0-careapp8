import { db, type PushSubscriptionRecord } from "./db"

const DEFAULT_ICON = "/icon-192.png"
const DEFAULT_BADGE = "/badge-96.png"
const DEFAULT_TAG = "care-app-alert"
const DEFAULT_USER_ID = "default"

/**
 * Legacy helper – prefer ensurePermission for on-demand prompts.
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
 */
export async function registerServiceWorker(): Promise<void> {
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

export type LocalNotificationOptions = {
  title: string
  body?: string
  data?: { url?: string }
}

/**
 * Show a local notification via Service Worker (fallbacks to toast).
 */
export async function notifyLocal(opts: LocalNotificationOptions): Promise<void> {
  const { title, body = "", data } = opts

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
        data: data ?? {},
        requireInteraction: false,
      })
      return
    } catch (error) {
      console.warn("[notifyLocal] showNotification failed, fallback to toast:", error)
    }
  }

  try {
    const { toast } = await import("sonner")
    toast(`${title}${body ? ` – ${body}` : ""}`)
  } catch {
    console.log("[notifyLocal] fallback:", title, body)
  }
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = typeof atob === "function" ? atob(base64) : ""
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i)
  }
  return output
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
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
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
      applicationServerKey: base64UrlToUint8Array(vapidKey),
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
