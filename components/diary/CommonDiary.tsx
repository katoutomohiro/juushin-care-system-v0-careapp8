"use client";
import React, { useState, useEffect } from "react";
import { createEntry, listEntries, type DiaryEntry } from "../../hooks/useDiary";
import type { UnifiedEntry, UnifiedRecordT, UnifiedCategory } from "../../schemas/unified";
import { dexieDiaryToUnified, unifiedToDexieDiary } from "../../lib/model-adapters";
import { ActivityForm } from "../forms/activity-form";
import { VitalsForm } from "../forms/vitals-form";
import { SeizureForm } from "../forms/seizure-form";
import { ExpressionForm } from "../forms/expression-form";
import { HydrationForm } from "../forms/hydration-form";
import { ExcretionForm } from "../forms/excretion-form";

export type CommonDiaryProps = {
  serviceId?: string;
  userId?: string;
};

/**
 * CommonDiary は unified スキーマと useDiary を統合し、
 * 各サービス（生活介護・放課後等デイ・重度訪問）で共通利用できる日誌UIです。
 * ARIA属性を強化し、アクセシビリティを重視しています。
 */
export default function CommonDiary({ serviceId, userId }: CommonDiaryProps) {
  const [entries, setEntries] = useState<UnifiedEntry[]>([]);
  const [category, setCategory] = useState<UnifiedCategory>("vitals");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const raw = await listEntries();
      const unified = raw.map((d) => dexieDiaryToUnified(d, { userId, serviceId }));
      setEntries(unified);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // フォームコールバックで実際の記録を作成する想定
    await loadEntries();
  };

  const handleCancel = () => {
    // フォームをリセット/キャンセル
  };

  return (
    <div className="space-y-6 p-4" role="main" aria-labelledby="diary-title">
      <h1 id="diary-title" className="text-2xl font-bold" tabIndex={-1}>
        共通日誌 (Diary)
      </h1>

      <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
        <span>サービス: {serviceId ?? "(全般)"}</span> · <span>利用者: {userId ?? "(全般)"}</span>
      </div>

      <div className="border-t pt-4">
        <label htmlFor="category-select" className="block text-sm font-medium mb-2">
          記録カテゴリ
        </label>
        <select
          id="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value as UnifiedCategory)}
          className="border p-2 rounded w-full max-w-xs"
          aria-label="記録カテゴリ選択"
        >
          <option value="vitals">バイタルサイン</option>
          <option value="seizure">発作</option>
          <option value="care">ケア</option>
          <option value="hydration">水分補給</option>
          <option value="excretion">排泄</option>
          <option value="activity">活動</option>
          <option value="observation">観察</option>
          <option value="other">その他</option>
        </select>
      </div>

      <div className="border rounded p-4 bg-gray-50" role="region" aria-label="選択中の記録フォーム">
        {category === "vitals" && (
          <VitalsForm selectedUser={userId ?? ""} onSubmit={handleSave} onCancel={handleCancel} />
        )}
        {category === "seizure" && (
          <SeizureForm selectedUser={userId ?? ""} onSubmit={handleSave} onCancel={handleCancel} />
        )}
        {category === "care" && (
          <ExpressionForm selectedUser={userId ?? ""} onSubmit={handleSave} onCancel={handleCancel} />
        )}
        {category === "hydration" && (
          <HydrationForm selectedUser={userId ?? ""} onSubmit={handleSave} onCancel={handleCancel} />
        )}
        {category === "excretion" && (
          <ExcretionForm selectedUser={userId ?? ""} onSubmit={handleSave} onCancel={handleCancel} />
        )}
        {category === "activity" && (
          <ActivityForm selectedUser={userId ?? ""} onSubmit={handleSave} onCancel={handleCancel} />
        )}
        {(category === "observation" || category === "other") && (
          <div className="text-sm text-gray-600">
            このカテゴリのフォームは今後追加予定です。
          </div>
        )}
      </div>

      <div className="border-t pt-4" role="region" aria-label="最近の記録">
        <h2 className="text-lg font-semibold mb-2">最近の記録 ({entries.length}件)</h2>
        {loading && <p className="text-sm text-gray-500" aria-live="polite">読み込み中...</p>}
        {!loading && entries.length === 0 && (
          <p className="text-sm text-gray-500">まだ記録がありません。</p>
        )}
        <ul className="space-y-2">
          {entries.slice(0, 5).map((e) => (
            <li key={e.id} className="border p-2 rounded bg-white">
              <div className="text-sm font-medium">{e.date} - {e.category}</div>
              {e.records.length > 0 && (
                <div className="text-xs text-gray-600">
                  記録数: {e.records.length} | 最終更新: {new Date(e.updatedAt).toLocaleString("ja-JP")}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
