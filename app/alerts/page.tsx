'use client';
import React, { useEffect, useState } from 'react';
import { db, type Alert } from '../../lib/db';

function getLevelBadgeClass(level: string): string {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'warn': return 'bg-yellow-100 text-yellow-800';
    case 'info': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('default');
  const [days, setDays] = useState(7);

  async function load() {
    setLoading(true);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    const rows = await db.alerts
      .where('userId').equals(userId)
      .and(a => a.date >= cutoffDate)
      .reverse()
      .sortBy('createdAt');

    setAlerts(rows.slice(0, 20)); // limit to 20
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [userId, days]);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">⚠️ アラート一覧</h1>

      <div className="flex gap-3 items-end bg-gray-50 p-4 rounded border">
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="alert-user">User ID</label>
          <input
            id="alert-user"
            className="border rounded px-3 py-2"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="default"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="alert-days">期間</label>
          <select
            id="alert-days"
            className="border rounded px-3 py-2"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>直近7日</option>
            <option value={14}>直近14日</option>
            <option value={30}>直近30日</option>
          </select>
        </div>
        <button
          onClick={load}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded"
        >
          更新
        </button>
      </div>

      <div className="bg-white border rounded divide-y">
        {loading ? (
          <div className="p-4 text-gray-500">読み込み中…</div>
        ) : alerts.length === 0 ? (
          <div className="p-4 text-gray-500">該当期間にアラートはありません。</div>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className="p-4 flex items-start gap-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelBadgeClass(a.level)}`}>
                {a.level.toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{a.message}</div>
                <div className="text-xs text-gray-500">
                  日付: {a.date} / タイプ: {a.type}
                  {a.metrics && ` / ${JSON.stringify(a.metrics)}`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>※ 将来機能: 通知設定、アラート詳細ページ、エクスポートなど</p>
      </div>
    </div>
  );
}
