'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { login } from './actions'

function LoginFormContent() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/services/life-care/users'

  const error = searchParams.get('error')
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ/タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">重心ケア支援</h1>
          <p className="text-gray-600">ケア記録システム</p>
        </div>
        
        {/* ログインフォーム */}
        <form action={login} method="post" className="bg-white rounded-lg shadow-lg p-8">
          {/* エラー表示 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">エラー</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {/* メール */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              name="email"
              type="email"
              placeholder="your-email@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          
          {/* パスワード */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          
          {/* ボタン */}
          <input type="hidden" name="redirect" value={redirectPath} />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Loader2 className="w-4 h-4" />
            ログイン
          </button>
        </form>
        
        {/* 情報パネル */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>デモアカウント:</strong> 本番環境では管理者が職員をSSOで招待します
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">読み込み中...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}
