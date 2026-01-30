import { z } from "zod";

/**
 * 📋 TIME-SERIES DESIGN NOTE (cf. docs/RECORDS_API_DESIGN_EVOLUTION.md):
 * 
 * Current unified schema supports basic observation categories but is not optimized
 * for time-series analytics or AI-driven analysis.
 * 
 * Key limitations in current structure:
 *   ❌ Seizures: Single entry per record_date. Multiple seizures on same day not captured.
 *      Fix: Change UnifiedSeizureInfo to array of timestamped events
 *      
 *   ❌ Excretion: Boolean flags only (pee/poo). No detail on time, amount, quality.
 *      Fix: Add excretion_events[] with { occurred_at, type, amount, consistency }
 *      
 *   ❌ Sleep: Currently in custom_fields. No standardized start/end time or quality metric.
 *      Fix: Add sleep_events[] with { started_at, ended_at, quality, disturbances[] }
 *      
 *   ❌ Nutrition/Hydration: Classified by category but lack quantity & time granularity.
 *      Fix: Add nutrition_events[] with { occurred_at, meal_type, intake_rate, items[] }
 *      
 *   ❌ Vitals: Only single time per record. Clinically, multiple measurements per day needed.
 *      Fix: Add vitals_events[] with { measured_at, heart_rate, temperature, ... }
 * 
 * MIGRATION STRATEGY (future):
 *   Phase 1: Dual format in record_data (legacy custom_fields + new events[] arrays)
 *   Phase 2: API aggregation endpoint for analytics
 *   Phase 3: AI analysis endpoint using structured time-series data
 * 
 * See docs/RECORDS_API_DESIGN_EVOLUTION.md Section 3 for full normalized schema proposal.
 */

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
