import type { DiaryEntry, MedicalRecord } from "../lib/db"
import { UnifiedEntrySchema } from "../schemas/unified"
import type { UnifiedEntry, UnifiedRecordT, UnifiedCategory } from "../schemas/unified"

export interface JournalEntry {
  title: string
  content: string
  category: string
  timestamp?: string
  tags?: string[]
}

interface JournalToUnifiedOptions {
  id?: string
  userId?: string
  serviceId?: string
  timestamp?: string
}

const createRandomId = () => {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function journalToUnified(j: JournalEntry, options?: JournalToUnifiedOptions): UnifiedEntry {
  const timestamp = options?.timestamp ?? j.timestamp ?? new Date().toISOString()
  const base: Partial<UnifiedEntry> = {
    id: options?.id ?? createRandomId(),
    userId: options?.userId,
    serviceId: options?.serviceId,
    date: timestamp,
    title: j.title,
    content: j.content,
    category: (j.category as UnifiedCategory) || "other",
    tags: j.tags ?? [],
    records: [
      {
        time: timestamp,
        notes: j.content,
      },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  return UnifiedEntrySchema.parse(base)
}

export function unifiedToJournal(u: UnifiedEntry): JournalEntry {
  return {
    title: u.title ?? "",
    content: u.content ?? "",
    category: u.category,
    timestamp: u.date,
    tags: u.tags,
  }
}

export function dexieDiaryToUnified(d: DiaryEntry, opts?: { userId?: string; serviceId?: string }): UnifiedEntry {
  const records: UnifiedRecordT[] = d.records.map((r) => ({
    time: r.time,
    notes: r.notes,
    vitals: {
      heartRate: r.heartRate,
      temperature: r.temperature,
      oxygenSaturation: r.oxygenSaturation,
    },
    seizure: r.seizureType
      ? {
          seizureType: r.seizureType,
        }
      : undefined,
    pee: r.pee,
    poo: r.poo,
  }))

  let category: UnifiedCategory = "other"
  if (d.records.some((r) => r.heartRate || r.temperature || r.oxygenSaturation)) category = "vitals"
  else if (d.records.some((r) => r.seizureType)) category = "seizure"

  const base = {
    id: d.id,
    date: d.date,
    category,
    records,
    attachments: (d.photos || []).map((uri) => ({ type: "photo" as const, uri })),
    editHistory: (d.editHistory || []).map((eh) => ({
      timestamp: eh.timestamp,
      editor: eh.editor,
      changes: eh.changes,
    })),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    userId: opts?.userId,
    serviceId: opts?.serviceId,
  } as Partial<UnifiedEntry>
  return UnifiedEntrySchema.parse(base)
}

export function unifiedToDexieDiary(u: UnifiedEntry): DiaryEntry {
  const records: MedicalRecord[] = u.records.map((r) => ({
    time: r.time,
    heartRate: r.vitals?.heartRate,
    temperature: r.vitals?.temperature,
    oxygenSaturation: r.vitals?.oxygenSaturation,
    seizureType: r.seizure?.seizureType,
    notes: r.notes,
    pee: r.pee,
    poo: r.poo,
  }))

  return {
    id: u.id,
    date: u.date,
    records,
    photos: u.attachments?.filter((a) => a.type === "photo").map((a) => a.uri),
    editHistory: u.editHistory?.map((eh) => ({
      timestamp: eh.timestamp,
      editor: eh.editor,
      changes: eh.changes,
    })),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}
