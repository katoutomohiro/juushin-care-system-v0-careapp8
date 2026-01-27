'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[UsersListPage Error Boundary]', error)
  }, [error])

  return (
    <div style={{ padding: 16 }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 24,
        border: '1px solid #e5e5e5',
        borderRadius: 8,
        backgroundColor: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: '#dc2626' }}>
          <AlertCircle style={{ width: 24, height: 24 }} />
          <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>エラーが発生しました</h2>
        </div>
        
        <p style={{ color: '#666', marginBottom: 16 }}>
          利用者一覧の読み込み中にエラーが発生しました。
        </p>
        
        {error.message && (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            fontSize: 14,
            fontFamily: 'monospace',
            color: '#dc2626',
            marginBottom: 16
          }}>
            {error.message}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            再試行
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #e5e5e5',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            トップに戻る
          </button>
        </div>
      </div>
    </div>
  )
}
