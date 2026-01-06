"use client"

import { CaseRecordForm } from "@/src/components/case-records/CaseRecordForm"
import { atCaseRecordStaffOptions, buildATCaseRecordInitial } from "./at-case-record-form-shared"
import type { CaseRecordFormProps } from "@/src/components/case-records/CaseRecordForm"

export default function ATCaseRecordFormOffline() {
  const initial: CaseRecordFormProps["initial"] = buildATCaseRecordInitial()
  const staffOptions = atCaseRecordStaffOptions

  const handleSubmit: CaseRecordFormProps["onSubmit"] = async (values) => {
    // オフライン時はIndexedDBへ保存するなどの既存ロジックに接続
    console.log("ATCaseRecordFormOffline submit", values)
  }

  return (
    <CaseRecordForm initial={initial} staffOptions={staffOptions} onSubmit={handleSubmit} submitLabel="保存" />
  )
}
