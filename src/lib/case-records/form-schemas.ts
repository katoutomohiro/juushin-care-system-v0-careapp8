import { z } from "zod"

// ヘッダ部（共通）
export const CaseRecordHeaderSchema = z.object({
  date: z.string().min(1, "必須です"),
  careReceiverId: z.string().min(1, "利用者IDは必須です"),
  serviceId: z.string().min(1, "必須です"),
  // 方針1: 主担当は必須
  mainStaffId: z.string().min(1, "主担当は必須です"),
  subStaffId: z.string().nullable().optional(),
})

// メモ/備考（共通）
export const CaseRecordNotesSchema = z.object({
  specialNotes: z.string().optional(),
  familyNotes: z.string().optional(),
})

// 全体フォーム（増やす場合はここに拡張）
export const CaseRecordFormSchema = CaseRecordHeaderSchema.merge(CaseRecordNotesSchema)

export type CaseRecordHeader = z.infer<typeof CaseRecordHeaderSchema>
export type CaseRecordNotes = z.infer<typeof CaseRecordNotesSchema>
export type CaseRecordFormValues = z.infer<typeof CaseRecordFormSchema>
