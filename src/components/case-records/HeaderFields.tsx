"use client"

import type { ChangeEvent } from "react"

export type HeaderFieldsProps = {
  date: string
  time: string
  userId: string
  serviceId: string
  onChange: (patch: Partial<HeaderFieldsProps>) => void
}

export function HeaderFields({ date, time, userId, serviceId, onChange }: HeaderFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">日付</label>
        <input
          type="date"
          value={date}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ date: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">時刻</label>
        <input
          type="time"
          value={time}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ time: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">利用者ID</label>
        <input
          value={userId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ userId: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">サービスID</label>
        <input
          value={serviceId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ serviceId: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
    </div>
  )
}
