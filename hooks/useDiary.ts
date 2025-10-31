/* eslint-disable */
export type DiaryEntry = import('../schemas/diary').DiaryEntry;
export type MedicalRecord = import('../schemas/diary').MedicalRecord;
const KEY = 'diaryEntries';
const safeWindow: any = typeof window !== 'undefined' ? window : undefined;
function readAll(): DiaryEntry[] {
  if (!safeWindow) return [];
  try { return JSON.parse(safeWindow.localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeAll(list: DiaryEntry[]) {
  if (!safeWindow) return;
  safeWindow.localStorage.setItem(KEY, JSON.stringify(list));
}
export function createEntry(entry: DiaryEntry) {
  const list = readAll();
  const i = list.findIndex(e => e.id === entry.id);
  if (i >= 0) list[i] = entry; else list.push(entry);
  writeAll(list);
}
export function listEntries(): DiaryEntry[] { return readAll(); }
export function getEntry(id: string): DiaryEntry | undefined { return readAll().find(e => e.id === id); }
export function monthlyStats(ym: string) {
  const list = readAll().filter(e => e.date.startsWith(ym));
  const days = list.flatMap(e => e.records.map(r => ({ date: e.date, hr: r.heartRate ?? null, temp: r.temperature ?? null })));
  return days;
}
