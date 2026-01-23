'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/browsers'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/services/life-care/users'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  
  const handleLogin = async () => {
    console.log('🔵 handleLogin called', { email, hasPassword: !!password })
    setError(null)
    setIsLoading(true)
    
    try {
      console.log('[LOGIN] supabase client:', supabase ? 'OK' : 'UNDEFINED')
      console.log('[LOGIN] calling signInWithPassword with email:', email)
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('[LOGIN] signInWithPassword result:', { hasData: !!data, hasError: !!authError, errorMsg: authError?.message })
      
      if (authError) {
        const errMsg = authError.message
        console.error('[LOGIN] Auth error:', errMsg)
        setError(errMsg)
        return
      }
      
      if (!data.user) {
        console.error('[LOGIN] No user in response data')
        setError('ログインに失敗しました')
        return
      }
      
      console.log('[LOGIN] Success! User:', data.user.email, 'Redirecting to:', redirectPath)
      // ログイン成功 → redirect path へ
      router.push(redirectPath)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'エラーが発生しました'
      console.error('[LOGIN] Exception:', errMsg, err)
      setError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSignUp = async () => {
    setError(null)
    setIsLoading(true)
    
    try {
      // 本番環境では admin が招待リンクで signup を管理
      // ここはデモ用のみ
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) {
        setError(authError.message)
        return
      }
      
      setError(null)
      setEmail('')
      setPassword('')
      setIsSignUp(false)
      // signup 後、メール確認が必要
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      handleSignUp()
    } else {
      handleLogin()
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ/タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">重心ケア支援</h1>
          <p className="text-gray-600">ケア記録システム</p>
        </div>
        
        {/* ログインフォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          
          {/* パスワード */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          
          {/* ボタン */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? 'サインアップ' : 'ログイン'}
          </button>
          
          {/* トグルリンク */}
          <p className="text-center text-sm text-gray-600 mt-4">
            {isSignUp ? 'ログイン画面へ' : 'アカウントを作成'}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="text-blue-600 hover:underline ml-1"
            >
              {isSignUp ? 'ここをクリック' : 'ここをクリック'}
            </button>
          </p>
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
