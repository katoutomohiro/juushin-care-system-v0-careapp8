"use client"

import DateWithWeekdayField from "../fields/DateWithWeekdayField"

export type HeaderFieldsProps = {
  date: string
  careReceiverName: string  // 利用者名（読み取り専用）
  onChange: (patch: Partial<HeaderFieldsProps>) => void
}

export function HeaderFields({ date, careReceiverName, onChange }: HeaderFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DateWithWeekdayField
        value={date}
        onChange={(nextDate) => onChange({ date: nextDate })}
        name="date"
        id="date"
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">利用者名</label>
        <input
          aria-label="利用者名"
          value={careReceiverName}
          readOnly
          className="border rounded px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
        />
      </div>
    </div>
  )
}
