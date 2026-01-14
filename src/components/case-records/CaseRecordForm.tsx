"use client"

import { useState, useEffect } from "react"
import { HeaderFields } from "@/src/components/case-records/HeaderFields"
import { StaffSelector, type StaffOption } from "@/src/components/case-records/StaffSelector"
import { NotesSection } from "@/src/components/case-records/NotesSection"
import { TemplateFieldsSection } from "@/src/components/case-records/TemplateFieldsSection"
import { TemplateField, TemplateFormValues } from "@/lib/templates/schema"

export type CaseRecordFormProps = {
  initial: {
    date: string
    careReceiverId: string
    careReceiverName: string
    serviceId: string
    mainStaffId?: string | null
    subStaffId?: string | null
    specialNotes?: string
    familyNotes?: string
    custom?: TemplateFormValues
  }
  staffOptions: StaffOption[]
  allStaff?: Array<{ id: string; name: string; sort_order: number; is_active: boolean }>
  templateFields?: TemplateField[]
  onSubmit: (values: CaseRecordFormProps["initial"]) => Promise<void> | void
  submitLabel?: string
  isSubmitting?: boolean
  validationErrors?: { mainStaffId?: string }
  onUpdateStaff?: (staff: { id: string; name: string; sort_order?: number; is_active?: boolean }) => void
}

export function CaseRecordForm({
  initial,
  staffOptions,
  allStaff = [],
  templateFields = [],
  onSubmit,
  submitLabel = "保存",
  isSubmitting = false,
  validationErrors,
  onUpdateStaff,
}: CaseRecordFormProps) {
  const [state, setState] = useState(initial)
  const customData = state.custom ?? {}

  // Sync props.initial changes to state (especially careReceiverName, careReceiverId)
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      ...initial,
      custom: initial.custom ?? prevState.custom,
    }))
  }, [initial.careReceiverId, initial.careReceiverName, initial.date, initial.serviceId])

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (isSubmitting) return
        void onSubmit(state)
      }}
    >
      <HeaderFields
        date={state.date}
        careReceiverName={state.careReceiverName}
        onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
      />

      <StaffSelector
        mainStaffId={state.mainStaffId ?? null}
        subStaffId={state.subStaffId ?? null}
        options={staffOptions}
        onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
        validationError={validationErrors?.mainStaffId}
        serviceId={state.serviceId}
        allStaff={allStaff}
        onUpdateStaff={onUpdateStaff}
      />

      <NotesSection
        specialNotes={state.specialNotes}
        familyNotes={state.familyNotes}
        onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
      />

      {templateFields.length > 0 && (
        <TemplateFieldsSection
          fields={templateFields}
          values={customData}
          onChange={(fieldId, value) => {
            setState((s) => ({
              ...s,
              custom: {
                ...customData,
                [fieldId]: value,
              },
            }))
          }}
        />
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
