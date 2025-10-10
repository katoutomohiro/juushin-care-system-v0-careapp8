"use client"

import type React from "react"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface SmartSelectProps {
  label: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  disabled?: boolean
}

export function SmartSelect({ label, value, onChange, placeholder, options, disabled }: SmartSelectProps) {
  const [open, setOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useState(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  })

  const handleCardClick = () => {
    if (disabled) return
    if (isMobile) {
      setSheetOpen(true)
    } else {
      setOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault()
      handleCardClick()
    }
  }

  const handleMobileSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setSheetOpen(false)
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <div
              className="cursor-pointer border rounded-md p-3 bg-background hover:bg-accent"
              onClick={handleCardClick}
              onKeyDown={handleKeyDown}
              tabIndex={disabled ? -1 : 0}
              role="button"
              aria-label={`${label}を選択`}
            >
              {value ? options.find((opt) => opt.value === value)?.label : placeholder || "選択してください"}
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-full">
            <SheetHeader>
              <SheetTitle>{label}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <RadioGroup value={value} onValueChange={handleMobileSelect}>
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className="cursor-pointer"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`${label}を選択`}
      >
        <Select open={open} onOpenChange={setOpen} value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder || "選択してください"} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
