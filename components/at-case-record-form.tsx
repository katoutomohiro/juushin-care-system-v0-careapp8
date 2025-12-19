"use client"

import { CaseRecordForm } from "@/src/components/case-records/CaseRecordForm"
import type { CaseRecordFormProps } from "@/src/components/case-records/CaseRecordForm"

export default function ATCaseRecordForm() {
  const initial: CaseRecordFormProps["initial"] = {
    date: "",
    time: "",
    userId: "",
    serviceId: "",
    mainStaffId: null,
    subStaffIds: [],
    specialNotes: "",
    familyNotes: "",
  }

  const staffOptions: { value: string; label: string }[] = []

  const handleSubmit: CaseRecordFormProps["onSubmit"] = async (values) => {
    // 既存の保存ロジックと接続する場合はここで呼び出す（Supabase/IndexedDB等）
    console.log("ATCaseRecordForm submit", values)
  }

  return (
    <CaseRecordForm initial={initial} staffOptions={staffOptions} onSubmit={handleSubmit} submitLabel="保存" />
  )
}
