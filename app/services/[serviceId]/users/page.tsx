'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { buildCareReceiversUrl } from '@/lib/utils/care-receiver-urls'

type User = {
  id: string
  code: string
  name: string
  age?: number
  gender?: string
  care_level?: number
  condition?: string
  medical_care?: string
  is_active?: boolean
  service_code?: string
}

export default function UsersPage() {
  const params = useParams()
  const router = useRouter()
  
  // Params validation - prevent crash
  if (!params?.serviceId) {
    return (
      <div style={{ padding: 16 }}>
        <h2>エラー</h2>
        <p>サービスIDが指定されていません</p>
      </div>
    )
  }
  
  const serviceId = params.serviceId as string
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Guard: only fetch if serviceId is a non-empty string
        if (typeof serviceId !== 'string' || !serviceId.trim()) {
          console.warn('[UsersPage] serviceId is missing or empty:', serviceId)
          setUsers([])
          setLoading(false)
          return
        }

        const url = buildCareReceiversUrl(serviceId)
        if (!url) {
          console.warn('[UsersPage] serviceId is missing after trim:', serviceId)
          setUsers([])
          setLoading(false)
          return
        }
        console.log('[UsersPage] Fetching care receivers from:', url)
        const res = await fetch(url, {
          cache: 'no-store',
        })
        
        // If HTTP error, log details but do NOT set error state (caller sees nothing)
        if (!res.ok) {
          const bodyText = await res.text()
          console.error('[UsersPage] HTTP error', {
            status: res.status,
            statusText: res.statusText,
            url,
            responseBody: bodyText,
          })
          if (mounted) {
            setUsers([])
            setLoading(false)
          }
          return
        }
        
        // Parse JSON only if response.ok
        const json = await res.json()
        console.log('[UsersPage] API response:', { ok: json.ok, count: json.careReceivers?.length })
        
        // どんな形で返ってきても落ちない
        const list = Array.isArray(json?.careReceivers) ? json.careReceivers : []
        
        if (mounted) {
          setUsers(list)
          setLoading(false)
        }
      } catch (e: any) {
        const errorMsg = e instanceof Error ? e.message : String(e)
        console.error('[UsersPage] Exception during fetch', {
          message: errorMsg,
          error: e instanceof Error ? e.stack : String(e),
        })
        if (mounted) {
          setUsers([])
          setLoading(false)
        }
      }
    }

    fetchUsers()
    
    return () => {
      mounted = false
    }
  }, [serviceId])

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <p>読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 16, color: 'red' }}>
        <h2>エラー</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!users.length) {
    return (
      <div style={{ padding: 16 }}>
        <h1>利用者一覧 ({serviceId})</h1>
        <p>利用者が登録されていません</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>利用者一覧 ({serviceId})</h1>
      <p style={{ marginBottom: 16, color: '#666' }}>件数: {users.length}</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map((u) => {
          // Safety check - skip invalid entries
          if (!u?.id || !u?.code) {
            console.warn('[UsersPage] Skipping invalid user:', u)
            return null
          }
          
          return (
          <li
            key={u.id}
            onClick={() => {
              try {
                router.push(`/services/${serviceId}/users/${u.id}`)
              } catch (err) {
                console.error('[UsersPage] Navigation error:', err)
              }
            }}
            style={{
              padding: 16,
              marginBottom: 8,
              border: '1px solid #ddd',
              borderRadius: 8,
              cursor: 'pointer',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>
              {u.name}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              ID: {u.code}
              {u.age && ` | 年齢: ${u.age}歳`}
              {u.gender && ` | 性別: ${u.gender}`}
            </div>
          </li>
          )
        })}
      </ul>
    </div>
  )
}
