"use client"

import * as React from "react"

type Props = {
  label?: string
  value: string // ISO: "YYYY-MM-DD"
  onChange: (nextIso: string) => void
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
}

function formatJaWithWeekday(iso: string) {
  if (!iso) return ""
  // Safari対策で "YYYY-MM-DD" をそのまま new Date(iso) しない
  const [y, m, d] = iso.split("-").map((v) => Number(v))
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)

  const ymd = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)

  const wd = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(date)
  return `${ymd}(${wd})`
}

export default function DateWithWeekdayField({
  label = "日付",
  value,
  onChange,
  name = "date",
  id = "date",
  disabled,
  required,
}: Props) {
  const hiddenRef = React.useRef<HTMLInputElement | null>(null)

  const display = React.useMemo(() => formatJaWithWeekday(value), [value])

  const openPicker = () => {
    if (!hiddenRef.current) return
    // focusしてからpicker
    hiddenRef.current.focus()
    // Chromium系は showPicker がある
    const input = hiddenRef.current as HTMLInputElement & { showPicker?: () => void }
    if (typeof input.showPicker === "function")
      input.showPicker()
    else hiddenRef.current.click()
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${id}__display`} className="text-sm text-muted-foreground">
        {label}
      </label>

      {/* 見た目 */}
      <input
        id={`${id}__display`}
        name={`${name}__display`}
        type="text"
        readOnly
        value={display}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPicker()
        }}
        disabled={disabled}
        className="w-full rounded-md border px-3 py-2 cursor-pointer bg-white"
        aria-label={label}
      />

      {/* 裏の本物（実際の date input） */}
      <input
        ref={hiddenRef}
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
      />
    </div>
  )
}
