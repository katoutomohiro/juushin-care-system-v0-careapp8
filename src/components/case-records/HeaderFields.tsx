"use client"

import type { ChangeEvent } from "react"

export type HeaderFieldsProps = {
  date: string
  time: string
  userId: string
  serviceId: string
  onChange: (patch: Partial<HeaderFieldsProps>) => void
}

/**
 * 日付をYYYY/MM/DD(曜)形式にフォーマットする
 * @param dateStr ISO形式の日付文字列 (YYYY-MM-DD)
 * @returns フォーマット済みの日付文字列 (例: 2026/01/14(水))
 */
function formatDateJapanese(dateStr: string): string {
  if (!dateStr) return ""
  
  try {
    const [year, month, day] = dateStr.split("-")
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`)
    
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    })
    
    // 結果は「2026/01/14 水」という形式で返される
    const formatted = formatter.format(date)
    // 曜日の直後に括弧を付ける
    return formatted.replace(/(\d+)(\s)(\S+)$/, "$1($3)")
  } catch {
    return ""
  }
}

export function HeaderFields({ date, time, userId, serviceId, onChange }: HeaderFieldsProps) {
  const displayDate = formatDateJapanese(date)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">日付</label>
        <input
          type="date"
          aria-label="日付"
          value={date}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ date: e.target.value })}
          className="border rounded px-3 py-2"
        />
        {displayDate && (
          <span className="text-sm text-primary font-medium mt-1">
            {displayDate}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">時刻</label>
        <input
          type="time"
          aria-label="時刻"
          value={time}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ time: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">利用者ID</label>
        <input
          aria-label="利用者ID"
          value={userId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ userId: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">サービスID</label>
        <input
          aria-label="サービスID"
          value={serviceId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ serviceId: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
    </div>
  )
}
