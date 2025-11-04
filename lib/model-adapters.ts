import type { DiaryEntry, MedicalRecord } from "../lib/db";
import { UnifiedEntrySchema } from "../schemas/unified";
import type { UnifiedEntry, UnifiedRecordT, UnifiedCategory } from "../schemas/unified";

export type JournalEntry = {
  id: string;
  date: string;
  category: string;
  data: Record<string, any>;
};

export function journalToUnified(j: JournalEntry): UnifiedEntry {
  const base = {
    id: j.id,
    date: j.date,
    category: (j.category as UnifiedCategory) || "other",
    records: [
      {
        time: j.date,
        notes: JSON.stringify(j.data),
      },
    ],
    createdAt: j.date,
    updatedAt: j.date,
  } as Partial<UnifiedEntry>;
  return UnifiedEntrySchema.parse(base);
}

export function unifiedToJournal(u: UnifiedEntry): JournalEntry {
  return {
    id: u.id,
    date: u.date,
    category: u.category,
    data: u.records[0] ? JSON.parse(u.records[0].notes || "{}") : {},
  };
}

export function dexieDiaryToUnified(d: DiaryEntry, opts?: { userId?: string; serviceId?: string }): UnifiedEntry {
  const records: UnifiedRecordT[] = d.records.map(r => ({
    time: r.time,
    notes: r.notes,
    vitals: {
      heartRate: r.heartRate,
      temperature: r.temperature,
      oxygenSaturation: r.oxygenSaturation,
    },
    seizure: r.seizureType ? {
      seizureType: r.seizureType,
    } : undefined,
    pee: r.pee,
    poo: r.poo,
  }));
  
  let category: UnifiedCategory = "other";
  if (d.records.some(r => r.heartRate || r.temperature || r.oxygenSaturation)) category = "vitals";
  else if (d.records.some(r => r.seizureType)) category = "seizure";

  const base = {
    id: d.id,
    date: d.date,
    category,
    records,
    attachments: (d.photos || []).map(uri => ({ type: "photo" as const, uri })),
    editHistory: (d.editHistory || []).map(eh => ({
      timestamp: eh.timestamp,
      editor: eh.editor,
      changes: eh.changes,
    })),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    userId: opts?.userId,
    serviceId: opts?.serviceId,
  } as Partial<UnifiedEntry>;
  return UnifiedEntrySchema.parse(base);
}

export function unifiedToDexieDiary(u: UnifiedEntry): DiaryEntry {
  const records: MedicalRecord[] = u.records.map(r => ({
    time: r.time,
    heartRate: r.vitals?.heartRate,
    temperature: r.vitals?.temperature,
    oxygenSaturation: r.vitals?.oxygenSaturation,
    seizureType: r.seizure?.seizureType,
    notes: r.notes,
    pee: r.pee,
    poo: r.poo,
  }));
  
  return {
    id: u.id,
    date: u.date,
    records,
    photos: u.attachments?.filter(a => a.type === "photo").map(a => a.uri),
    editHistory: u.editHistory?.map(eh => ({
      timestamp: eh.timestamp,
      editor: eh.editor,
      changes: eh.changes,
    })),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}
