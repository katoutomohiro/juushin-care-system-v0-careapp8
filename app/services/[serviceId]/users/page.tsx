'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface CareReceiver {
  id: string
  code: string
  name: string
  age?: number
  gender?: string
  careLevel?: string
  condition?: string
  medicalCare?: string
}

export default function UsersListPage() {
  const params = useParams()
  const serviceId = typeof params.serviceId === 'string' ? params.serviceId : ''
  
  const [users, setUsers] = useState<CareReceiver[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    if (!serviceId) {
      console.warn('[UsersListPage] serviceId not available')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Map serviceId to service_code for API call
      // serviceId is like "life-care", "after-school", etc.
      const response = await fetch(`/api/care-receivers/list?serviceCode=${encodeURIComponent(serviceId)}`, { 
        cache: 'no-store' 
      })
      const data = await response.json()

      if (data.ok) {
        setUsers(data.users || [])
      } else {
        console.error('[UsersListPage] API returned error:', data.error)
        setUsers([])
      }
    } catch (err) {
      console.error('[UsersListPage] Failed to fetch users:', err)
      setError(String(err))
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [serviceId])

  // Refresh when window gains focus (user navigates back from detail page)
  useEffect(() => {
    const handleFocus = () => {
      fetchUsers()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [serviceId])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">利用者管理</h1>
          <button
            disabled
            className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            新規利用者追加（準備中）
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-600">読み込み中...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">エラーが発生しました: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && users.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-700 text-lg">利用者が登録されていません</p>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && users.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">氏名</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">年齢</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">性別</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ケアレベル</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.age || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.gender || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.careLevel || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/services/${serviceId}/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        詳細へ →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
