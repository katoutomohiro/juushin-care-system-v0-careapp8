'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../../lib/db';
import type { Medication } from '../../schemas/medication';

function todayYMD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function MedicationsPage() {
  const [items, setItems] = useState<Medication[]>([]);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState(''); // HH:mm
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const date = useMemo(() => todayYMD(), []);
  const canCreate = useMemo(
    () => name.trim().length > 0 && dosage.trim().length > 0 && /^\d{2}:\d{2}$/.test(time),
    [name, dosage, time]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const rows = (await db.table('medications').where('date').equals(date).toArray()) as Medication[];
    rows.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    setItems(rows);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  async function addMedication(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setCreating(true);
    const med: Medication = {
      id: crypto.randomUUID(),
      userId: 'default',
      name: name.trim(),
      dosage: dosage.trim(),
      time,
      taken: false,
      date,
    };
    await db.table('medications').put(med);
    setName('');
    setDosage('');
    setTime('');
    setCreating(false);
    load();
  }

  async function toggleTaken(med: Medication) {
    await db.table('medications').update(med.id, { taken: !med.taken });
    load();
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">服薬スケジュール</h1>
      <div className="text-sm text-gray-600">対象日: {date}</div>

      <form onSubmit={addMedication} className="flex flex-wrap items-end gap-3 bg-gray-50 p-4 rounded border">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm text-gray-600 mb-1" htmlFor="med-name">薬剤名</label>
          <input id="med-name" className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：アセトアミノフェン" required />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-sm text-gray-600 mb-1" htmlFor="med-dosage">用量</label>
          <input id="med-dosage" className="w-full border rounded px-3 py-2" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="例：200mg" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="med-time">時刻</label>
          <input id="med-time" type="time" className="border rounded px-3 py-2" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
        <button type="submit" disabled={!canCreate || creating} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded disabled:opacity-50">
          {creating ? '追加中…' : '追加'}
        </button>
      </form>

      <div className="bg-white border rounded divide-y">
        {loading ? (
          <div className="p-4 text-gray-500">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-gray-500">本日のスケジュールはありません。上のフォームから追加してください。</div>
        ) : (
          items.map((it) => (
            <label key={it.id} className="flex items-center gap-3 p-4">
              <input
                type="checkbox"
                checked={it.taken}
                onChange={() => toggleTaken(it)}
                aria-label={`服薬完了: ${it.name} ${it.dosage} / ${it.time}`}
              />
              <div className="flex-1">
                <div className={`font-medium ${it.taken ? 'line-through text-gray-400' : 'text-gray-900'}`}>{it.name} <span className="text-sm text-gray-600">{it.dosage}</span></div>
                <div className="text-xs text-gray-500">予定時刻: {it.time} / ユーザー: {it.userId}</div>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
