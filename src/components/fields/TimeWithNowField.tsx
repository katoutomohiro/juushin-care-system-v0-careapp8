"use client"

import * as React from "react"

type Props = {
  label?: string
  value: string // HH:mm format
  onChange: (nextTime: string) => void
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
}

function getCurrentTimeHHmm(): string {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

export function TimeWithNowField({
  label = "時刻",
  value,
  onChange,
  name = "time",
  id = "time",
  disabled,
  required,
}: Props) {
  const handleNowClick = () => {
    const currentTime = getCurrentTimeHHmm()
    onChange(currentTime)
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full border rounded px-3 py-2 pr-16"
          aria-label={label}
        />
        <button
          type="button"
          onClick={handleNowClick}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          今すぐ
        </button>
      </div>
    </div>
  )
}
