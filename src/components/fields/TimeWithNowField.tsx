"use client"

import { useCallback } from "react"

type Props = {
  name: string
  value: string
  onChange: (e: { target: { name: string; value: string } }) => void
}

export default function TimeWithNowField({ name, value, onChange }: Props) {
  const setNow = useCallback(() => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, "0")
    const mm = String(now.getMinutes()).padStart(2, "0")
    onChange({ target: { name, value: `${hh}:${mm}` } })
  }, [name, onChange])

  return (
    <div className="relative w-full min-w-0">
      <input
        type="time"
        className="w-full min-w-0 pr-16 border rounded px-3 py-2"
        value={value ?? ""}
        onChange={(e) => onChange({ target: { name, value: e.target.value } })}
      />
      <button
        type="button"
        onClick={setNow}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded border px-2 py-1 text-xs bg-white"
      >
        今すぐ
      </button>
    </div>
  )
}
