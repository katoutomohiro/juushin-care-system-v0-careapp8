import { z } from "zod"

export const SeizureLogSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().min(1),
  occurredAt: z.string().datetime(), // ISO
  seizureType: z.enum(["強直間代", "ミオクロニー", "ピク付き", "上視線", "不明"]),
  durationSec: z.number().int().min(0).max(36000),
  response: z.enum(["吸引", "体位変換", "投薬", "見守り"]),
  notes: z.string().max(1000).optional(),
  reviewer: z.string().optional(),
})

export type SeizureLog = z.infer<typeof SeizureLogSchema>
