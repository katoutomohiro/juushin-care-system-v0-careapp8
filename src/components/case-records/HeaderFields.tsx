"use client"

import type { ChangeEvent } from "react"
import DateWithWeekdayField from "../fields/DateWithWeekdayField"
import TimeWithNowField from "../fields/TimeWithNowField"

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
      <DateWithWeekdayField
        value={date}
        onChange={(nextDate) => onChange({ date: nextDate })}
        name="date"
        id="date"
      />
      <div className="min-w-0">
        <TimeWithNowField
          name="time"
          value={time}
          onChange={({ target }) => onChange({ time: target.value })}
          className="w-full"
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
