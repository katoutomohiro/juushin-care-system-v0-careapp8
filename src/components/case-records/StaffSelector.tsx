"use client"

export type StaffOption = { value: string; label: string }

export type StaffSelectorProps = {
  mainStaffId: string | null | undefined
  subStaffIds: string[] | null | undefined
  options: StaffOption[]
  onChange: (patch: { mainStaffId?: string | null; subStaffIds?: string[] | null }) => void
}

export function StaffSelector({ mainStaffId, subStaffIds, options, onChange }: StaffSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">主担当</label>
        <select
          className="border rounded px-3 py-2"
          value={mainStaffId ?? ""}
          onChange={(e) => onChange({ mainStaffId: e.target.value || null })}
        >
          <option value="">（未選択）</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">副担当（複数可）</label>
        <select
          className="border rounded px-3 py-2"
          multiple
          value={subStaffIds ?? []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
            onChange({ subStaffIds: selected })
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
