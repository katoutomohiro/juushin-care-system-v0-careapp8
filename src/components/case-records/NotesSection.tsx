"use client"

import type { ChangeEvent } from "react"

export type NotesSectionProps = {
  specialNotes?: string
  familyNotes?: string
  onChange: (patch: Partial<NotesSectionProps>) => void
}

export function NotesSection({ specialNotes, familyNotes, onChange }: NotesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">特記事項</label>
        <textarea
          aria-label="特記事項"
          value={specialNotes ?? ""}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ specialNotes: e.target.value })}
          className="border rounded px-3 py-2 min-h-28"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">家族連絡</label>
        <textarea
          aria-label="家族連絡"
          value={familyNotes ?? ""}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ familyNotes: e.target.value })}
          className="border rounded px-3 py-2 min-h-28"
        />
      </div>
    </div>
  )
}
