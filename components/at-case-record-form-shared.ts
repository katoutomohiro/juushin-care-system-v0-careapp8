import type { CaseRecordFormProps } from "@/src/components/case-records/CaseRecordForm"

export function buildAtCaseRecordInitial(): CaseRecordFormProps["initial"] {
  return {
    date: "",
    time: "",
    userId: "",
    serviceId: "",
    mainStaffId: null,
    subStaffIds: [],
    specialNotes: "",
    familyNotes: "",
  }
}

export function buildAtCaseRecordStaffOptions(): { value: string; label: string }[] {
  return []
}