"use client"

import React from "react"
import { CaseRecordForm } from "@/src/components/case-records/CaseRecordForm"
import type { CaseRecordFormProps } from "@/src/components/case-records/CaseRecordForm"

type AtCaseRecordFormConfig = {
  onSubmit?: CaseRecordFormProps["onSubmit"]
  submitLabel?: string
  logTag?: string
}

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

export function buildAtCaseRecordStaffOptions(): CaseRecordFormProps["staffOptions"] {
  return []
}

export function createAtCaseRecordForm(config: AtCaseRecordFormConfig = {}) {
  const { onSubmit, submitLabel = "保存", logTag = "ATCaseRecordForm submit" } = config

  return function AtCaseRecordFormInstance() {
    const initial = buildAtCaseRecordInitial()
    const staffOptions = buildAtCaseRecordStaffOptions()

    const handleSubmit: CaseRecordFormProps["onSubmit"] = onSubmit
      ? onSubmit
      : async (values) => {
          console.log(logTag, values)
        }

    return React.createElement(CaseRecordForm, {
      initial,
      staffOptions,
      onSubmit: handleSubmit,
      submitLabel,
    })
  }
}