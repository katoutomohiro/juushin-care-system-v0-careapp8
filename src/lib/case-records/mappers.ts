import type { CaseRecordFormValues } from "@/src/lib/case-records/form-schemas"

// フォーム値 → 保存用モデル（最低限のパススルー実装）
export function mapFormToModel(values: CaseRecordFormValues) {
  return {
    header: {
      date: values.date,
      serviceType: undefined,
      staffIds: [values.mainStaffId, values.subStaffId]
        .filter((id) => id != null && id !== "") as string[],
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
  const [main, sub] = staffIds
  return {
    serviceId: model?.header?.serviceId ?? "",
    date: model?.header?.date ?? "",
    mainStaffId: main ?? "",
    subStaffId: sub ?? null,
    specialNotes: model?.notes?.special ?? "",
    familyNotes: model?.notes?.family ?? "",
  }
}
