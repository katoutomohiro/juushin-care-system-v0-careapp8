import { z } from "zod";

export const UnifiedCategoryEnum = z.enum([
  "vitals", "care", "medical", "communication", "observation",
  "seizure", "nutrition", "hydration", "excretion", "positioning",
  "respiratory", "skin_oral", "swallowing", "activity", "other",
]);

export const UnifiedTag = z.string().min(1).max(50);

export const UnifiedAttachment = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["photo", "file", "link"]).default("photo"),
  uri: z.string(),
  caption: z.string().max(200).optional(),
});

export const UnifiedVitals = z.object({
  heartRate: z.number().int().min(0).max(300).optional(),
  temperature: z.number().min(30).max(45).optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
});

export const UnifiedSeizureInfo = z.object({
  seizureType: z.string().optional(),
  durationSec: z.number().int().min(0).max(36000).optional(),
  response: z.string().optional(),
});

export const UnifiedRecord = z.object({
  time: z.string(),
  notes: z.string().max(2000).optional(),
  vitals: UnifiedVitals.optional(),
  seizure: UnifiedSeizureInfo.optional(),
  pee: z.boolean().optional(),
  poo: z.boolean().optional(),
});

export const UnifiedEditHistory = z.object({
  timestamp: z.string(),
  editor: z.string(),
  changes: z.string(),
});

export const UnifiedEntrySchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  serviceId: z.string().optional(),
  date: z.string(),
  title: z.string().max(100).optional(),
  content: z.string().max(5000).optional(),
  category: UnifiedCategoryEnum.default("observation"),
  tags: z.array(UnifiedTag).default([]),
  records: z.array(UnifiedRecord).default([]),
  attachments: z.array(UnifiedAttachment).default([]),
  editHistory: z.array(UnifiedEditHistory).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  encryptedData: z.string().optional(),
});

export type UnifiedEntry = z.infer<typeof UnifiedEntrySchema>;
export type UnifiedRecordT = z.infer<typeof UnifiedRecord>;
export type UnifiedEditHistoryT = z.infer<typeof UnifiedEditHistory>;
export type UnifiedAttachmentT = z.infer<typeof UnifiedAttachment>;
export type UnifiedCategory = z.infer<typeof UnifiedCategoryEnum>;
