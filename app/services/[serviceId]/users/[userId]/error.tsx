'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[UserDetailPage Error Boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4 text-destructive">
          <AlertCircle className="w-6 h-6" />
          <h2 className="text-xl font-bold">エラーが発生しました</h2>
        </div>
        
        <p className="text-muted-foreground mb-4">
          利用者情報の読み込み中にエラーが発生しました。
        </p>
        
        {error.message && (
          <div className="bg-muted p-3 rounded text-sm mb-4 font-mono text-destructive">
            {error.message}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button onClick={() => reset()} variant="default">
            再試行
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
