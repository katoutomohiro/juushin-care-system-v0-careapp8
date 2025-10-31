'use client';
import { useEffect, useState } from 'react';
import { getEntry, updateEntry, DiaryEntry } from '../../../hooks/useDiary';

export default function DiaryDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    getEntry(id).then((e) => {
      if (e) {
        setEntry(e);
        setNotes(e.records[0]?.notes || '');
      }
    });
  }, [id]);

  const handleSaveEdit = async () => {
    if (!entry) return;
    const updatedRecords = entry.records.map((r, i) =>
      i === 0 ? { ...r, notes } : r
    );
    await updateEntry(id, { records: updatedRecords }, 'user');
    const refreshed = await getEntry(id);
    if (refreshed) setEntry(refreshed);
    setEditMode(false);
    alert('Updated');
  };

  if (!entry) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Diary Detail</h1>
      <p className="text-sm text-gray-500">ID: {entry.id}</p>
      <p className="text-sm text-gray-500">Date: {entry.date}</p>
      
      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Records</h2>
        {entry.records.map((r, i) => (
          <div key={i} className="mb-2">
            <p>Time: {r.time}</p>
            {r.heartRate && <p>Heart Rate: {r.heartRate} bpm</p>}
            {r.temperature && <p>Temperature: {r.temperature} °C</p>}
            {r.oxygenSaturation && <p>SpO2: {r.oxygenSaturation} %</p>}
            {r.notes && <p>Notes: {r.notes}</p>}
          </div>
        ))}
      </div>

      {entry.photos && entry.photos.length > 0 && (
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Photos</h2>
          {entry.photos.map((url, i) => (
            <img key={i} src={url} alt={`Photo ${i}`} className="max-w-xs rounded border mt-2" />
          ))}
        </div>
      )}

      {entry.editHistory && entry.editHistory.length > 0 && (
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Edit History</h2>
          {entry.editHistory.map((h, i) => (
            <div key={i} className="text-sm text-gray-600 mb-1">
              {h.timestamp} by {h.editor}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Edit
          </button>
        ) : (
          <div className="space-y-2">
            <label className="flex flex-col">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border p-2 rounded"
                rows={3}
              />
            </label>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

