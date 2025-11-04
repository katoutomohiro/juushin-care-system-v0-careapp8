import { db, type DiaryEntry, type EditHistory, type MedicalRecord } from "@/lib/db"
import { getStoredUserId } from "@/contexts/user-context"
import { computeDailyAlertsDay } from "@/services/alerts/computeDailyAlertsDay"
import { compareAlertsAndNotify } from "@/services/alerts/notify"

/**
 * Dexie ベースの日誌操作ユーティリティ
 */
export async function createEntry(entry: Partial<DiaryEntry>): Promise<string> {
  const now = new Date().toISOString()
  const fullEntry: DiaryEntry = {
    id: entry.id || crypto.randomUUID(),
    date: entry.date || new Date().toISOString().slice(0, 10),
    records: entry.records || [],
    photos: entry.photos || [],
    editHistory: entry.editHistory || [],
    createdAt: entry.createdAt || now,
    updatedAt: now,
  }

  await db.diaryEntries.put(fullEntry)

  const userId = getStoredUserId()
  const prevAlerts = await db.alerts.where("userId").equals(userId).and((a) => a.date === fullEntry.date).toArray()
  await computeDailyAlertsDay(userId, fullEntry.date)
  await compareAlertsAndNotify(userId, fullEntry.date, prevAlerts)

  return fullEntry.id
}

export async function listEntries(): Promise<DiaryEntry[]> {
  return await db.diaryEntries.orderBy("date").reverse().toArray()
}

export async function getEntry(id: string): Promise<DiaryEntry | undefined> {
  return await db.diaryEntries.get(id)
}

export async function updateEntry(id: string, updates: Partial<DiaryEntry>, editor: string = "system"): Promise<void> {
  const existing = await db.diaryEntries.get(id)
  if (!existing) throw new Error("Entry not found")

  const editHistory: EditHistory[] = existing.editHistory || []
  editHistory.push({
    timestamp: new Date().toISOString(),
    editor,
    changes: JSON.stringify(updates),
  })

  await db.diaryEntries.update(id, {
    ...updates,
    editHistory,
    updatedAt: new Date().toISOString(),
  })

  const date = updates.date || existing.date
  const userId = getStoredUserId()
  const prevAlerts = await db.alerts.where("userId").equals(userId).and((a) => a.date === date).toArray()
  await computeDailyAlertsDay(userId, date)
  await compareAlertsAndNotify(userId, date, prevAlerts)
}

export async function deleteEntry(id: string): Promise<void> {
  await db.diaryEntries.delete(id)
}

export async function monthlyStats(ym: string) {
  const entries = await db.diaryEntries.where("date").startsWith(ym).toArray()

  const days = entries.flatMap((entry) =>
    entry.records.map((record) => ({
      date: entry.date,
      hr: record.heartRate ?? null,
      temp: record.temperature ?? null,
      spO2: record.oxygenSaturation ?? null,
      seizure: record.seizureType ? 1 : 0,
    })),
  )
  return days
}

export type { DiaryEntry, MedicalRecord, EditHistory }
