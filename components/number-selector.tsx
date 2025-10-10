"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface NumberSelectorProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  className?: string
  disabled?: boolean
}

export function NumberSelector({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  className = "",
  disabled = false,
}: NumberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const generateOptions = () => {
    const options = []
    for (let i = min; i <= max; i += step) {
      const val = step < 1 ? Number(i.toFixed(1)) : i
      options.push({ value: val, label: `${val}${unit}` })
    }
    return options
  }

  const options = generateOptions()

  const handleSelect = (selectedValue: number) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  const currentLabel = `${value}${unit}`

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "w-full h-12 px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-blue-500 ring-2 ring-blue-500",
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="text-gray-900">{currentLabel}</span>
        <svg
          className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 transition-colors",
                  option.value === value && "bg-blue-50 text-blue-700",
                )}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
            {options.length === 0 && <div className="px-3 py-2 text-gray-500 text-center">選択肢がありません</div>}
          </div>
        </>
      )}
    </div>
  )
}
