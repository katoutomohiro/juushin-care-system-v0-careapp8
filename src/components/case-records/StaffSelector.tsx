"use client"

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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">主担当</label>
        <select
          className={`border rounded px-3 py-2 ${
            hasError ? "border-red-500 bg-red-50" : ""
          }`}
          aria-label="主担当を選択"
          value={mainStaffId ?? ""}
          onChange={(e) => onChange({ mainStaffId: e.target.value || null })}
        >
          <option value="">（未選択）</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {hasError ? (
          <p className="text-sm text-red-600 mt-1">{validationError}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">※主担当は自動で設定されます（必要に応じて変更できます）</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">副担当</label>
        <select
          className="border rounded px-3 py-2"
          aria-label="副担当を選択"
          value={subStaffId ?? ""}
          onChange={(e) => onChange({ subStaffId: e.target.value || null })}
        >
          <option value="">（未選択）</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
