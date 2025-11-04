'use client'

import { useEffect, useMemo, useState } from "react"
import { registerServiceWorker, subscribePush, unsubscribePush, getStoredSubscription } from "../lib/notifications"
import type { PushSubscriptionRecord } from "../lib/db"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker().catch((error) => {
      console.warn("[ServiceWorkerRegistration] registerServiceWorker failed:", error)
    })
  }, [])

  return null
}

type PushSubscriptionButtonProps = {
  userId?: string
  className?: string
}

export function PushSubscriptionButton({ userId = "default", className }: PushSubscriptionButtonProps) {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [record, setRecord] = useState<PushSubscriptionRecord | undefined>()

  const supported = useMemo(
    () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window,
    [],
  )

  useEffect(() => {
    if (!supported) return
    getStoredSubscription(userId)
      .then((stored) => {
        setRecord(stored)
        setSubscribed(Boolean(stored))
      })
      .catch((error) => {
        console.warn("[PushSubscriptionButton] failed to read stored subscription:", error)
      })
  }, [supported, userId])

  async function handleEnable() {
    setLoading(true)
    setMessage(null)
    const subscription = await subscribePush(userId)
    if (subscription) {
      const stored = await getStoredSubscription(userId)
      setRecord(stored)
      setSubscribed(true)
      setMessage("Push通知を有効化しました")
    } else {
      setMessage("Push通知を有効化できませんでした")
    }
    setLoading(false)
  }

  async function handleDisable() {
    setLoading(true)
    setMessage(null)
    const success = await unsubscribePush()
    if (success) {
      setRecord(undefined)
      setSubscribed(false)
      setMessage("Push通知を無効化しました")
    } else {
      setMessage("Push通知の解除に失敗しました")
    }
    setLoading(false)
  }

  if (!supported) {
    return (
      <p className={className ?? "text-xs text-gray-500"}>
        Push通知はこのブラウザではご利用いただけません
      </p>
    )
  }

  const buttonLabel = subscribed ? "Push通知を無効にする" : "Push通知を有効にする"

  return (
    <div className={className ?? "flex flex-col gap-1 text-sm text-gray-600"}>
      <button
        type="button"
        onClick={subscribed ? handleDisable : handleEnable}
        disabled={loading}
        className="inline-flex items-center justify-center rounded border border-sky-500 px-3 py-1 text-sm font-medium text-sky-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "処理中…" : buttonLabel}
      </button>
      <div className="text-xs text-gray-500">
        {subscribed && record?.endpoint ? (
          <span>購読中: {record.endpoint.slice(0, 40)}…</span>
        ) : (
          <span>通知は未購読です</span>
        )}
        {message && <div className="mt-1 text-xs text-gray-400">{message}</div>}
      </div>
    </div>
  )
}
