import type { JournalEntry } from "../schemas/journal";
import type { DiaryEntry as DexieDiaryEntry, MedicalRecord } from "./db";
import { UnifiedEntrySchema, type UnifiedEntry, type UnifiedRecordT } from "../schemas/unified";

// Helper to ensure ISO date (YYYY-MM-DD)
function toYmd(dateLike?: string): string {
  if (!dateLike) return new Date().toISOString().slice(0, 10);
  if (dateLike.length >= 10) return dateLike.slice(0, 10);
  return dateLike;
}

export function journalToUnified(j: JournalEntry, opts?: { id?: string; userId?: string; serviceId?: string }): UnifiedEntry {
  const now = new Date().toISOString();
  const u: UnifiedEntry = {
    id: opts?.id || crypto.randomUUID(),
    userId: opts?.userId,
    serviceId: opts?.serviceId,
    date: toYmd(j.timestamp),
    title: j.title,
    content: j.content,
    category: (j.category as any) ?? "observation",
    tags: j.tags || [],
    records: [],
    attachments: [],
    editHistory: [],
    createdAt: now,
    updatedAt: now,
  };
  return UnifiedEntrySchema.parse(u);
}

export function unifiedToJournal(u: UnifiedEntry): JournalEntry {
  return {
    title: u.title || "",
    content: u.content || "",
    category: (u.category as any) ?? "observation",
    timestamp: u.date,
    tags: u.tags || [],
  };
}

export function dexieDiaryToUnified(d: DexieDiaryEntry, opts?: { userId?: string; serviceId?: string }): UnifiedEntry {
  const records: UnifiedRecordT[] = (d.records || []).map((r: MedicalRecord) => ({
    time: r.time,
    notes: r.notes,
    vitals: {
      heartRate: r.heartRate,
      temperature: r.temperature,
      oxygenSaturation: r.oxygenSaturation,
    },
    seizure: r.seizureType ? { seizureType: r.seizureType } : undefined,
    pee: r.pee,
    poo: r.poo,
  }));

  return UnifiedEntrySchema.parse({
    id: d.id,
    userId: opts?.userId,
    serviceId: opts?.serviceId,
    date: d.date,
    category: "observation",
    records,
    attachments: (d.photos || []).map(uri => ({ uri, type: "photo" as const })),
    editHistory: d.editHistory || [],
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    encryptedData: d.encryptedData,
  });
}

export function unifiedToDexieDiary(u: UnifiedEntry): DexieDiaryEntry {
  const records: MedicalRecord[] = (u.records || []).map((r) => ({
    time: r.time,
    notes: r.notes,
    heartRate: r.vitals?.heartRate,
    temperature: r.vitals?.temperature,
    oxygenSaturation: r.vitals?.oxygenSaturation,
    seizureType: r.seizure?.seizureType,
    pee: r.pee,
    poo: r.poo,
  }));

  return {
    id: u.id,
    date: u.date,
    records,
    photos: (u.attachments || []).filter(a => a.type === "photo").map(a => a.uri),
    editHistory: u.editHistory,
    encryptedData: u.encryptedData,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}
