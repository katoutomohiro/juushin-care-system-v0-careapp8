"use client"

import * as React from "react"

type Props = {
  name: string
  value: string
  onChange: (e: { target: { name: string; value: string } }) => void
  label?: string
  className?: string
}

function toHHmm(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

export default function TimeWithNowField({
  name,
  value,
  onChange,
  label = "時刻",
  className = "",
}: Props) {
  const handleNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const v = toHHmm(new Date())
    onChange({ target: { name, value: v } })
  }

  return (
    <div className={className}>
      <label className="block text-sm mb-1" htmlFor={name}>
        {label}
      </label>

      <div className="relative">
        <input
          type="time"
          name={name}
          value={value || ""}
          onChange={(e) => onChange({ target: { name, value: e.target.value } })}
          className="w-full border rounded-md px-3 py-2 pr-20"
        />

        <button
          type="button"
          onClick={handleNow}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm border rounded-md px-3 py-1 bg-white"
        >
          今すぐ
        </button>
      </div>
    </div>
  )
}
