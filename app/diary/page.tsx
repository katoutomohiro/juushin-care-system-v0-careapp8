'use client';
import { useState } from 'react';
import { createEntry } from '../../hooks/useDiary';

export default function DiaryPage() {
  const [heartRate, setHr] = useState<number | ''>('');
  const [temperature, setTp] = useState<number | ''>('');
  const [spO2, setSpO2] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const onSave = async () => {
    const record = {
      time: new Date().toISOString(),
      heartRate: heartRate === '' ? undefined : Number(heartRate),
      temperature: temperature === '' ? undefined : Number(temperature),
      oxygenSaturation: spO2 === '' ? undefined : Number(spO2),
      notes,
    };
    
    const photos = photoPreview ? [photoPreview] : [];
    await createEntry({ records: [record], photos });
    alert('Saved to IndexedDB');
    
    // リセット
    setHr('');
    setTp('');
    setSpO2('');
    setNotes('');
    setPhoto(null);
    setPhotoPreview('');
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Diary</h1>
      <div className="flex flex-col space-y-2">
        <label className="flex flex-col">
          Heart Rate (bpm)
          <input
            value={heartRate}
            onChange={(e) => setHr(e.target.value ? Number(e.target.value) : '')}
            type="number"
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          Temperature (°C)
          <input
            value={temperature}
            onChange={(e) => setTp(e.target.value ? Number(e.target.value) : '')}
            type="number"
            step="0.1"
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          SpO2 (%)
          <input
            value={spO2}
            onChange={(e) => setSpO2(e.target.value ? Number(e.target.value) : '')}
            type="number"
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded"
            rows={3}
          />
        </label>
        <label className="flex flex-col">
          Photo Attachment
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="border p-2 rounded" />
        </label>
        {photoPreview && (
          <div className="mt-2">
            <img src={photoPreview} alt="Preview" className="max-w-xs rounded border" />
          </div>
        )}
        <button onClick={onSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save
        </button>
      </div>
    </div>
  );
}

