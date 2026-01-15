"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 未選択を表現するダミー値
const NONE = "__none__"

export type StaffOption = { value: string; label: string }

export type StaffSelectorProps = {
  mainStaffId: string | null | undefined
  subStaffId: string | null | undefined
  options: StaffOption[]
  onChange: (patch: { mainStaffId?: string | null; subStaffId?: string | null }) => void
  validationError?: string | null  // エラーメッセージ
}

export function StaffSelector({ mainStaffId, subStaffId, options, onChange, validationError }: StaffSelectorProps) {
  const hasError = !!validationError
  
  // UI 値: NONE or uuid
  const mainSelectValue = mainStaffId ?? NONE
  const subSelectValue = subStaffId ?? NONE
  
  const handleMainChange = (v: string) => {
    onChange({ mainStaffId: v === NONE ? null : v })
  }
  
  const handleSubChange = (v: string) => {
    onChange({ subStaffId: v === NONE ? null : v })
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">主担当</label>
        <Select value={mainSelectValue} onValueChange={handleMainChange}>
          <SelectTrigger
            className={`${
              hasError ? "border-red-500 bg-red-50" : ""
            }`}
            aria-label="主担当を選択"
          >
            <SelectValue placeholder="（未選択）" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>（未選択）</SelectItem>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasError ? (
          <p className="text-sm text-red-600 mt-1">{validationError}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">※主担当は自動で設定されます（必要に応じて変更できます）</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">副担当</label>
        <Select value={subSelectValue} onValueChange={handleSubChange}>
          <SelectTrigger aria-label="副担当を選択">
            <SelectValue placeholder="（未選択）" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>（未選択）</SelectItem>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
