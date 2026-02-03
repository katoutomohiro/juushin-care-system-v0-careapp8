"use client"

import { useEffect } from "react"

/**
 * Force-unregister any existing Service Workers on client start.
 * This prevents hydration mismatches caused by stale SW caches.
 */
export function ServiceWorkerUnregister(): null {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          for (const reg of regs) {
            reg.unregister().catch(() => {})
          }
        })
        .catch(() => {})
    }
  }, [])
  return null
}
