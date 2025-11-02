import { db, DiaryEntry, MedicalRecord, EditHistory } from '../lib/db';
import { computeDailyAlerts } from '../services/alerts/computeDailyAlerts';
import { compareAlertsAndNotify } from '../services/alerts/notify';

/**
 * Dexie ベースの日誌操作フック
 */

export async function createEntry(entry: Partial<DiaryEntry>): Promise<string> {
  const now = new Date().toISOString();
  const fullEntry: DiaryEntry = {
    id: entry.id || crypto.randomUUID(),
    date: entry.date || new Date().toISOString().slice(0, 10),
    records: entry.records || [],
    photos: entry.photos || [],
    editHistory: entry.editHistory || [],
    createdAt: entry.createdAt || now,
    updatedAt: now,
  };
  await db.diaryEntries.put(fullEntry);
  // S-04: 保存後にアラート再計算と通知
  const userId = 'default'; // S-05でUserContextに置換
  const ym = fullEntry.date.slice(0, 7);
  const prev = await db.alerts.where('userId').equals(userId).and(a => a.date === fullEntry.date).toArray();
  await computeDailyAlerts(ym, userId);
  await compareAlertsAndNotify(userId, fullEntry.date, prev);
  return fullEntry.id;
}

export async function listEntries(): Promise<DiaryEntry[]> {
  return await db.diaryEntries.orderBy('date').reverse().toArray();
}

export async function getEntry(id: string): Promise<DiaryEntry | undefined> {
  return await db.diaryEntries.get(id);
}

export async function updateEntry(id: string, updates: Partial<DiaryEntry>, editor: string = 'system'): Promise<void> {
  const existing = await db.diaryEntries.get(id);
  if (!existing) throw new Error('Entry not found');
  
  const editHistory: EditHistory[] = existing.editHistory || [];
  editHistory.push({
    timestamp: new Date().toISOString(),
    editor,
    changes: JSON.stringify(updates),
  });

  await db.diaryEntries.update(id, {
    ...updates,
    editHistory,
    updatedAt: new Date().toISOString(),
  });
  // S-04: 更新後にアラート再計算と通知
  const date = updates.date || existing.date;
  const userId = 'default';
  const ym = date.slice(0, 7);
  const prev = await db.alerts.where('userId').equals(userId).and(a => a.date === date).toArray();
  await computeDailyAlerts(ym, userId);
  await compareAlertsAndNotify(userId, date, prev);
}

export async function deleteEntry(id: string): Promise<void> {
  await db.diaryEntries.delete(id);
}

export async function monthlyStats(ym: string) {
  const entries = await db.diaryEntries
    .where('date')
    .startsWith(ym)
    .toArray();
  
  const days = entries.flatMap(e =>
    e.records.map(r => ({
      date: e.date,
      hr: r.heartRate ?? null,
      temp: r.temperature ?? null,
      spO2: r.oxygenSaturation ?? null,
      seizure: r.seizureType ? 1 : 0,
    }))
  );
  return days;
}

export type { DiaryEntry, MedicalRecord, EditHistory };

