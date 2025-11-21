"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props { userId: string; serviceType: string; date: string }

export default function GenerateCaseRecordButton({ userId, serviceType, date }: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setStatus(null)
    try {
      // ローカルストレージから日誌相当データを取得（MVP: 仮仕様）
      const dailyLogRaw = localStorage.getItem('dailyLog')
      const dailyLog = dailyLogRaw ? JSON.parse(dailyLogRaw) : null
      const res = await fetch('/api/case-records/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, serviceType, recordDate: date, dailyLog }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '生成に失敗しました')
      setStatus('ケース記録を生成しました。再読込してください。')
    } catch (e: any) {
      setStatus(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button size="sm" variant="secondary" disabled={loading} onClick={handleGenerate}>
        {loading ? '生成中…' : '日誌からケース記録を生成'}
      </Button>
      {status && <p className="text-xs text-muted-foreground">{status}</p>}
    </div>
  )
}
