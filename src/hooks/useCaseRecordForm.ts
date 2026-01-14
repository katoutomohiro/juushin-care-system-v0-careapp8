"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CaseRecordFormSchema, type CaseRecordFormValues } from "@/src/lib/case-records/form-schemas"

export type UseCaseRecordFormOptions = {
  defaultValues?: Partial<CaseRecordFormValues>
  onSubmit?: (values: CaseRecordFormValues) => Promise<void> | void
}

export function useCaseRecordForm(options: UseCaseRecordFormOptions = {}) {
  const defaultValues = useMemo<CaseRecordFormValues>(() => ({
    serviceId: "",
    date: "",
    mainStaffId: "",
    subStaffIds: [],
    specialNotes: "",
    familyNotes: "",
    ...options.defaultValues,
  }), [options.defaultValues])

  const form = useForm<CaseRecordFormValues>({
    resolver: zodResolver(CaseRecordFormSchema),
    defaultValues,
    mode: "onBlur",
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    await options.onSubmit?.(values)
  })

  return { form, handleSubmit }
}
