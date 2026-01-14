"use client"

import { useCallback, useEffect, useState } from "react"

type Props = {
  name: string
  label?: string
  value: string // "HH:mm"
  onChange: (v: string) => void // 親フォームへ確実に返す
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function nowHHmm() {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export default function TimeWithNowField({
  name,
  label = "時刻",
  value,
  onChange,
}: Props) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const emitChange = useCallback(
    (next: string) => {
      setLocalValue(next)
      onChange(next)
    },
    [onChange],
  )

  const handleNow = useCallback(() => {
    emitChange(nowHHmm())
  }, [emitChange])

  const handleInputChange = (raw: string) => {
    const next = raw.slice(0, 5)
    if (/^\d{2}:\d{2}$/.test(next) || next === "") {
      emitChange(next)
    } else {
      setLocalValue(next)
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm mb-1" htmlFor={name}>
        {label}
      </label>

      <div className="relative w-full">
        <input
          id={name}
          name={name}
          type="text"
          inputMode="numeric"
          pattern="\d{2}:\d{2}"
          maxLength={5}
          value={localValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full border rounded-md px-3 py-2 pr-20"
          placeholder="HH:mm"
        />

        <button
          type="button"
          onClick={handleNow}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-sm rounded-md border bg-white hover:bg-gray-50"
        >
          今すぐ
        </button>
      </div>
    </div>
  )
}
