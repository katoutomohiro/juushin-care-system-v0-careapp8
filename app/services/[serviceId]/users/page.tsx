'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
        
        const res = await fetch(`/api/care-receivers/list?serviceCode=${encodeURIComponent(serviceId)}`, {
          cache: 'no-store',
        })
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        
        const json = await res.json()
        console.log('[UsersPage] API response:', { ok: json.ok, count: json.count, usersLength: json.users?.length })
        
        // どんな形で返ってきても落ちない
        const list = Array.isArray(json?.users) ? json.users : []
        
        if (mounted) {
          setUsers(list)
          setLoading(false)
        }
      } catch (e: any) {
        console.error('[UsersPage] Fetch error:', e)
        if (mounted) {
          setError(e?.message ?? 'Failed to load')
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
        {users.map((u) => (
          <li
            key={u.id}
            onClick={() => router.push(`/services/${serviceId}/users/${u.id}`)}
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
        ))}
      </ul>
    </div>
  )
}
