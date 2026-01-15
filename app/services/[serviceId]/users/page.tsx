'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

interface CareReceiver {
  id: string
  code: string
  name: string
  age?: number
  gender?: string
  care_level?: number
  condition?: string
  medical_care?: string
  is_active?: boolean
}

interface ServiceSection {
  code: string
  label: string
  icon: string
  ageRange: string
}

const SERVICE_SECTIONS: ServiceSection[] = [
  {
    code: 'life-care',
    label: '生活介護',
    icon: '🏥',
    ageRange: '18歳以上',
  },
  {
    code: 'after-school',
    label: '放課後等デイサービス',
    icon: '🎓',
    ageRange: '18歳以下',
  },
]

export default function UsersManagementPage() {
  const router = useRouter()
  const [sections, setSections] = useState<Record<string, {users: CareReceiver[], loading: boolean, error: string | null}>>({})
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeSections = async () => {
      setIsInitializing(true)
      const newSections: Record<string, {users: CareReceiver[], loading: boolean, error: string | null}> = {}

      // Fetch both services in parallel
      const results = await Promise.all(
        SERVICE_SECTIONS.map(async (section) => {
          try {
            const response = await fetch(`/api/care-receivers/list?serviceCode=${encodeURIComponent(section.code)}`, { 
              cache: 'no-store',
            })
            const data = await response.json()

            if (data.ok) {
              return {
                code: section.code,
                users: data.users || [],
                loading: false,
                error: null,
              }
            } else {
              const errorMsg = data.detail || data.error || '取得できませんでした'
              console.error(`[UsersManagement] API error for ${section.code}:`, data)
              return {
                code: section.code,
                users: [],
                loading: false,
                error: `エラー: ${errorMsg}`,
              }
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err)
            console.error(`[UsersManagement] Fetch error for ${section.code}:`, err)
            return {
              code: section.code,
              users: [],
              loading: false,
              error: `通信エラー: ${errMsg}`,
            }
          }
        })
      )

      results.forEach((result) => {
        newSections[result.code] = {
          users: result.users,
          loading: result.loading,
          error: result.error,
        }
      })

      setSections(newSections)
      setIsInitializing(false)
    }

    initializeSections()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">利用者管理</h1>
          <p className="text-gray-600">全サービスの利用者一覧</p>
        </div>

        {/* Loading State */}
        {isInitializing && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-600">読み込み中...</span>
          </div>
        )}

        {/* Sections */}
        {!isInitializing && (
          <div className="space-y-8">
            {SERVICE_SECTIONS.map((section) => {
              const sectionData = sections[section.code]
              if (!sectionData) return null

              const { users, loading, error } = sectionData
              const hasUsers = users && users.length > 0
              const isEmpty = !hasUsers && !error
              const hasError = !!error

              return (
                <div key={section.code} className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{section.icon}</span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{section.label}</h2>
                      <p className="text-sm text-gray-500">{section.ageRange}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                      {users?.length || 0} 名
                    </span>
                  </div>

                  {/* Loading */}
                  {loading && (
                    <div className="flex items-center justify-center py-8 bg-white rounded-lg">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-600">読み込み中...</span>
                    </div>
                  )}

                  {/* Error */}
                  {hasError && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 text-sm">エラーが発生しました</h4>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {isEmpty && !loading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                      <p className="text-blue-700">利用者が登録されていません</p>
                    </div>
                  )}

                  {/* Users Grid */}
                  {hasUsers && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => router.push(`/services/${section.code}/users/${user.id}`)}
                          className="bg-white rounded-lg shadow hover:shadow-lg hover:cursor-pointer transition-shadow p-6 border-l-4 border-l-blue-500"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">ID: {user.code}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            {user.age && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">年齢:</span>
                                <span className="font-medium">{user.age}歳</span>
                              </div>
                            )}
                            {user.gender && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">性別:</span>
                                <span className="font-medium">{user.gender}</span>
                              </div>
                            )}
                            {user.care_level && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">ケアレベル:</span>
                                <span className="font-medium">{user.care_level}</span>
                              </div>
                            )}
                            {user.condition && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">疾患:</span>
                                <span className="font-medium text-xs truncate">{user.condition}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">クリックで詳細へ →</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
