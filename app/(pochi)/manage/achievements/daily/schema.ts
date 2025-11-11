import { z } from "zod"

export const headerSchema = z.object({
  service: z.string().min(1, "サービスを選択してください。"),
  date: z
    .string()
    .min(1, "日付を入力してください。")
    .refine((value) => {
      if (!value) return false
      const parsed = Date.parse(value)
      return Number.isFinite(parsed)
    }, "有効な日付を入力してください。"),
  nurseMinutes: z
    .string()
    .min(1, "看護師看護時間を入力してください。")
    .refine((value) => /^\\d+$/.test(value), "数字で入力してください。"),
})

export const rowSchema = z.object({
  id: z.string(),
  userName: z.string().min(1, "利用者名を入力してください。"),
  plannedCare: z.string().min(1, "予定ケアを入力してください。"),
  achievedDescription: z.string().min(1, "実績内容を入力してください。"),
  achieved: z.boolean(),
  hasAlert: z.boolean(),
  notes: z.string().optional(),
})

export const draftSchema = z.object({
  header: headerSchema,
  rows: z.array(rowSchema),
})

export type DailyHeaderForm = z.infer<typeof headerSchema>
export type DailyRowForm = z.infer<typeof rowSchema>
export type DailyDraft = z.infer<typeof draftSchema>
