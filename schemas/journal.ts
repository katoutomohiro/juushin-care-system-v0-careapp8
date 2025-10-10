import { z } from "zod"

export const journalEntrySchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内で入力してください"),
  content: z.string().min(1, "内容は必須です").max(5000, "内容は5000文字以内で入力してください"),
  category: z.enum(["observation", "care", "medical", "communication", "other"], {
    errorMap: () => ({ message: "カテゴリーを選択してください" }),
  }),
  timestamp: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type JournalEntry = z.infer<typeof journalEntrySchema>
