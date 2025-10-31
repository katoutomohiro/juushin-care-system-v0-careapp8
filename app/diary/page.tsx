'use client';
import { useState } from 'react';
import { createEntry } from '../../hooks/useDiary';
export default function DiaryPage() {
  const [heartRate, setHr] = useState<number | ''>('');
  const [temperature, setTp] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const onSave = () => {
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : String(Date.now());
    const date = new Date().toISOString().slice(0,10);
    const record = { time: new Date().toISOString(), heartRate: heartRate=== ''? undefined:Number(heartRate), temperature: temperature=== ''? undefined:Number(temperature), notes } as any;
    createEntry({ id, date, records: [record] } as any);
    alert('Saved');
  };
  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Diary</h1>
      <label>Heart Rate <input value={heartRate} onChange={e=>setHr(e.target.value?Number(e.target.value):'')} type="number" className="border p-1"/></label>
      <label>Temperature <input value={temperature} onChange={e=>setTp(e.target.value?Number(e.target.value):'')} type="number" className="border p-1"/></label>
      <label>Notes <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="border p-1"/></label>
      <button onClick={onSave} className="bg-blue-600 text-white px-3 py-1">Save</button>
    </div>
  );
}
