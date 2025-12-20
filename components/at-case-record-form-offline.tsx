"use client"

import { CaseRecordForm } from "@/src/components/case-records/CaseRecordForm"
import type { CaseRecordFormProps } from "@/src/components/case-records/CaseRecordForm"

export default function ATCaseRecordFormOffline() {
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
    // オフライン時はIndexedDBへ保存するなどの既存ロジックに接続
    console.log("ATCaseRecordFormOffline submit", values)
  }

  return (
    <CaseRecordForm initial={initial} staffOptions={staffOptions} onSubmit={handleSubmit} submitLabel="保存" />
  )
}
