"use client"

import { useState } from "react"
import { HeaderFields } from "@/src/components/case-records/HeaderFields"
import { StaffSelector, type StaffOption } from "@/src/components/case-records/StaffSelector"
import { NotesSection } from "@/src/components/case-records/NotesSection"

export type CaseRecordFormProps = {
  initial: {
    date: string
    time: string
    userId: string
    serviceId: string
    mainStaffId?: string | null
    subStaffIds?: string[] | null
    specialNotes?: string
    familyNotes?: string
  }
  staffOptions: StaffOption[]
  onSubmit: (values: CaseRecordFormProps["initial"]) => Promise<void> | void
  submitLabel?: string
}

export function CaseRecordForm({ initial, staffOptions, onSubmit, submitLabel = "保存" }: CaseRecordFormProps) {
  const [state, setState] = useState(initial)

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit(state)
      }}
    >
      <HeaderFields
        date={state.date}
        time={state.time}
        userId={state.userId}
        serviceId={state.serviceId}
        onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
      />

      <StaffSelector
        mainStaffId={state.mainStaffId ?? null}
        subStaffIds={state.subStaffIds ?? []}
        options={staffOptions}
        onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
      />

      <NotesSection
        specialNotes={state.specialNotes}
        familyNotes={state.familyNotes}
        onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
      />

      <div className="flex justify-end gap-3">
        <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
