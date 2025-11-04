import { z } from 'zod';
export const MedicalRecordSchema = z.object({
  time: z.string(),
  heartRate: z.number().int().nonnegative().optional(),
  temperature: z.number().optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  seizureType: z.string().optional(),
  medsAt: z.array(z.string()).optional(),
  notes: z.string().optional(),
  pee: z.boolean().optional(),
  poo: z.boolean().optional(),
});
export const DiaryEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  records: z.array(MedicalRecordSchema),
});
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
export type DiaryEntry = z.infer<typeof DiaryEntrySchema>;
