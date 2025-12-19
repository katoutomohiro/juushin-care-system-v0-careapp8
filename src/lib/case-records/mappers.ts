import type { CaseRecordFormValues } from "@/src/lib/case-records/form-schemas"

// フォーム値 → 保存用モデル（最低限のパススルー実装）
export function mapFormToModel(values: CaseRecordFormValues) {
  return {
    header: {
      userId: values.userId,
      date: values.date,
      serviceType: undefined,
      staffIds: [values.mainStaffId, ...(values.subStaffIds ?? [])]
        .filter((id) => id != null && id !== "") as string[],
    },
    meta: {
      time: values.time,
    },
    notes: {
      special: values.specialNotes,
      family: values.familyNotes,
    },
  }
}

// 保存用モデル → フォーム値（最低限のパススルー実装）
export function mapModelToForm(model: any): CaseRecordFormValues {
  const staffIds = (model?.header?.staffIds ?? []) as string[]
  const [main, ...subs] = staffIds
  return {
    userId: model?.header?.userId ?? "",
    serviceId: model?.header?.serviceId ?? "",
    date: model?.header?.date ?? "",
    time: model?.meta?.time ?? "",
    mainStaffId: main ?? null,
    subStaffIds: subs ?? [],
    specialNotes: model?.notes?.special ?? "",
    familyNotes: model?.notes?.family ?? "",
  }
}
