"use client"

import { useEffect, useState, useCallback } from "react"
import { getSyncMeta, saveSyncMeta } from "@/lib/offline/db"

/**
 * オンライン/オフライン状態を管理
 * navigator.onLine をヒントに、実際の通信成功/失敗で判定を更新
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 初期状態を読み込み
    ;(async () => {
      const meta = await getSyncMeta()
      setIsOnline(meta.isOnline)
      setIsInitialized(true)
    })()
  }, [])

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    saveSyncMeta({ isOnline: true })
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    saveSyncMeta({ isOnline: false })
  }, [])

  useEffect(() => {
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, isInitialized }
}
