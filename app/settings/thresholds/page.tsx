"use client";
import { useState, useEffect } from "react";

type VitalType = "heartRate" | "temperature" | "spO2";

type Thresholds = {
  heartRate: { warnHigh: number; warnLow: number; critHigh: number; critLow: number };
  temperature: { warnHigh: number; warnLow: number; critHigh: number; critLow: number };
  spO2: { warnHigh: number; warnLow: number; critHigh: number; critLow: number };
};

const DEFAULT_THRESHOLDS: Thresholds = {
  heartRate: { warnHigh: 100, warnLow: 60, critHigh: 120, critLow: 50 },
  temperature: { warnHigh: 37.5, warnLow: 36.0, critHigh: 38.5, critLow: 35.0 },
  spO2: { warnHigh: 100, warnLow: 90, critHigh: 100, critLow: 85 },
};

const STORAGE_KEY = "ai-monitoring-thresholds";

export default function ThresholdsSettingsPage() {
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setThresholds(JSON.parse(stored));
      } catch {
        // fallback to defaults
      }
    }
  }, []);

  const handleChange = (vital: VitalType, key: keyof Thresholds["heartRate"], value: string) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;
    setThresholds((prev) => ({
      ...prev,
      [vital]: { ...prev[vital], [key]: numVal },
    }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    localStorage.removeItem(STORAGE_KEY);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto" role="main" aria-labelledby="settings-title">
      <h1 id="settings-title" className="text-2xl font-bold mb-4" tabIndex={-1}>
        AIモニタリング しきい値設定
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        バイタルサインの警告・危険域の閾値を設定します。設定はブラウザのローカルストレージに保存されます。
      </p>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-3 rounded mb-4" role="alert" aria-live="polite">
          保存しました！
        </div>
      )}

      <div className="space-y-6">
        {(["heartRate", "temperature", "spO2"] as VitalType[]).map((vital) => {
          const label =
            vital === "heartRate" ? "心拍数 (bpm)" : vital === "temperature" ? "体温 (°C)" : "SpO2 (%)";
          return (
            <div key={vital} className="border rounded p-4 bg-gray-50">
              <h2 className="text-lg font-semibold mb-3">{label}</h2>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium mb-1">注意域（高）</span>
                  <input
                    type="number"
                    step={vital === "temperature" ? "0.1" : "1"}
                    value={thresholds[vital].warnHigh}
                    onChange={(e) => handleChange(vital, "warnHigh", e.target.value)}
                    className="border p-2 rounded"
                    aria-label={`${label} 注意域（高）`}
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm font-medium mb-1">注意域（低）</span>
                  <input
                    type="number"
                    step={vital === "temperature" ? "0.1" : "1"}
                    value={thresholds[vital].warnLow}
                    onChange={(e) => handleChange(vital, "warnLow", e.target.value)}
                    className="border p-2 rounded"
                    aria-label={`${label} 注意域（低）`}
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm font-medium mb-1 text-red-600">危険域（高）</span>
                  <input
                    type="number"
                    step={vital === "temperature" ? "0.1" : "1"}
                    value={thresholds[vital].critHigh}
                    onChange={(e) => handleChange(vital, "critHigh", e.target.value)}
                    className="border p-2 rounded border-red-300"
                    aria-label={`${label} 危険域（高）`}
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm font-medium mb-1 text-red-600">危険域（低）</span>
                  <input
                    type="number"
                    step={vital === "temperature" ? "0.1" : "1"}
                    value={thresholds[vital].critLow}
                    onChange={(e) => handleChange(vital, "critLow", e.target.value)}
                    className="border p-2 rounded border-red-300"
                    aria-label={`${label} 危険域（低）`}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          aria-label="設定を保存"
        >
          💾 保存
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          aria-label="デフォルトに戻す"
        >
          🔄 デフォルトに戻す
        </button>
      </div>
    </div>
  );
}
