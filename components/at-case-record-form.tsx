"use client"

import { CaseRecordForm } from "@/src/components/case-records/CaseRecordForm"
import { atCaseRecordStaffOptions, buildATCaseRecordInitial } from "./at-case-record-form-shared"
import type { CaseRecordFormProps } from "@/src/components/case-records/CaseRecordForm"

export default function ATCaseRecordForm() {
  const initial: CaseRecordFormProps["initial"] = buildATCaseRecordInitial()
  const staffOptions = atCaseRecordStaffOptions

  const handleSubmit: CaseRecordFormProps["onSubmit"] = async (values) => {
    // 既存の保存ロジックと接続する場合はここで呼び出す（Supabase/IndexedDB等）
    console.log("ATCaseRecordForm submit", values)
  }

  return (
    <CaseRecordForm initial={initial} staffOptions={staffOptions} onSubmit={handleSubmit} submitLabel="保存" />
  )
}
