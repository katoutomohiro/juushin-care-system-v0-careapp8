'use client';
import React, { useEffect, useState } from 'react';
import { db, type Alert, type AlertType, type AlertLevel } from '../../lib/db';

function getLevelBadgeClass(level: string): string {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'warn': return 'bg-yellow-100 text-yellow-800';
    case 'info': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

type SortBy = 'createdAt-desc' | 'createdAt-asc' | 'level-desc';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('default');
  const [days, setDays] = useState(7);
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt-desc');

  async function load() {
    setLoading(true);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    let rows = await db.alerts
      .where('userId').equals(userId)
      .and(a => a.date >= cutoffDate)
      .toArray();

    // Apply filters
    if (typeFilter !== 'all') {
      rows = rows.filter(a => a.type === typeFilter);
    }
    if (levelFilter !== 'all') {
      rows = rows.filter(a => a.level === levelFilter);
    }

    // Apply sort
    if (sortBy === 'createdAt-desc') {
      rows.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'createdAt-asc') {
      rows.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'level-desc') {
      const levelPriority = { critical: 3, warn: 2, info: 1 };
      rows.sort((a, b) => (levelPriority[b.level] || 0) - (levelPriority[a.level] || 0));
    }

    setAlerts(rows.slice(0, 20)); // limit to 20
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [userId, days, typeFilter, levelFilter, sortBy]);

  function getDetailLink(alert: Alert): string {
    // Deep link to daily-log or seizure page for the date
    if (alert.type === 'seizure') {
      return `/daily-log/seizure?date=${alert.date}`;
    }
    return `/daily-log?date=${alert.date}`;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">⚠️ アラート一覧</h1>

      <div className="flex flex-wrap gap-3 items-end bg-gray-50 p-4 rounded border">
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
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="alert-type">タイプ</label>
          <select
            id="alert-type"
            className="border rounded px-3 py-2"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AlertType | 'all')}
          >
            <option value="all">すべて</option>
            <option value="vital">バイタル</option>
            <option value="seizure">てんかん</option>
            <option value="hydration">水分</option>
            <option value="sleep">睡眠</option>
            <option value="other">その他</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="alert-level">レベル</label>
          <select
            id="alert-level"
            className="border rounded px-3 py-2"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as AlertLevel | 'all')}
          >
            <option value="all">すべて</option>
            <option value="critical">重大</option>
            <option value="warn">警告</option>
            <option value="info">情報</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="alert-sort">並び順</label>
          <select
            id="alert-sort"
            className="border rounded px-3 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="createdAt-desc">新しい順</option>
            <option value="createdAt-asc">古い順</option>
            <option value="level-desc">重要度順</option>
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
              <a
                href={getDetailLink(a)}
                className="text-sky-600 hover:text-sky-700 text-sm font-medium whitespace-nowrap"
              >
                詳細へ →
              </a>
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
