"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { DailyLog } from "../lib/daily-log";

type Props = { log: DailyLog };

export default function DailyVitalsChart({ log }: Props) {
  const data = log.vitals.map((v) => ({
    time: new Date(v.time).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    HR: v.hr ?? null,
    SpO2: v.spo2 ?? null,
    RR: v.rr ?? null,
    Temp: v.temp ?? null,
  }));

  // 画面幅に応じてX軸tickを間引き（モバイル最適化）
  const isNarrow =
    typeof window !== "undefined" && window.innerWidth < 420;

  return (
    <div
      className="w-full rounded-2xl p-4 shadow-sm border"
      role="img"
      aria-label="日々のバイタル推移（心拍・SpO2・呼吸数・体温）"
    >
      <h3 className="text-lg font-semibold mb-2">
        バイタル推移（{log.date}）
      </h3>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 24, left: 12, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis
            dataKey="time"
            interval={isNarrow ? "preserveStartEnd" : 0}
            tick={{ fontSize: 11 }}
          />
          {/* 左Y軸：HR/RR/Temp */}
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${v}`}
            domain={[0, 160]}
            label={{
              value: "心拍(bpm)/呼吸数/体温(℃×10)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11 },
            }}
          />
          {/* 右Y軸：SpO2 */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${v}%`}
            domain={[80, 100]}
            label={{
              value: "SpO2(%)",
              angle: 90,
              position: "insideRight",
              style: { fontSize: 11 },
            }}
          />
          <Tooltip
            formatter={(value: number | null, name: string) => {
              if (value === null) return ["--", name];
              if (name === "HR") return [`${value} bpm`, "心拍"];
              if (name === "SpO2") return [`${value}%`, "SpO2"];
              if (name === "RR") return [`${value} 回/分`, "呼吸数"];
              if (name === "Temp")
                return [`${value.toFixed(1)} ℃`, "体温"];
              return [value, name];
            }}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />

          {/* 正常域の参考帯（SpO2 92%以上） */}
          <ReferenceArea
            yAxisId="right"
            y1={92}
            y2={100}
            fillOpacity={0.06}
            fill="green"
          />
          {/* 注意域（SpO2 92%未満） */}
          <ReferenceArea
            yAxisId="right"
            y1={80}
            y2={92}
            fillOpacity={0.1}
            fill="red"
          />
          {/* 補助線（SpO2 92%） */}
          <ReferenceLine
            yAxisId="right"
            y={92}
            stroke="#ef4444"
            strokeDasharray="6 6"
            strokeWidth={1}
          />

          {/* 心拍の目安線（上限110bpm） */}
          <ReferenceLine
            yAxisId="left"
            y={110}
            stroke="#f59e0b"
            strokeDasharray="6 6"
            strokeWidth={1}
          />

          {/* 実線（軽量化のためdot無し） */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="HR"
            name="心拍"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="SpO2"
            name="SpO2"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="RR"
            name="呼吸数"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Temp"
            name="体温"
            stroke="#10b981"
            strokeWidth={1.5}
            strokeDasharray="2 2"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">
        * 参考帯: SpO2 92%以上が正常域（緑）、92%未満は注意域（赤）。心拍110bpm以上は橙の補助線。
      </p>
    </div>
  );
}
