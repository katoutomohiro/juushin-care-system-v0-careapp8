'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type UserContextValue = {
  userId: string
  setUserId: (id: string) => void
}

const Ctx = createContext<UserContextValue | undefined>(undefined)
const STORAGE_KEY = 'careapp.userId'

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>('default')

  // 初期値をlocalStorageから復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && typeof saved === 'string') setUserId(saved)
    } catch {}
  }, [])

  // 変更を永続化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, userId)
    } catch {}
  }, [userId])

  const value = useMemo(() => ({ userId, setUserId }), [userId])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUser(): UserContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUser must be used within <UserProvider>')
  return v
}

// React外から利用するためのヘルパ
export function getStoredUserId(): string {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    return saved || 'default'
  } catch {
    return 'default'
  }
}
