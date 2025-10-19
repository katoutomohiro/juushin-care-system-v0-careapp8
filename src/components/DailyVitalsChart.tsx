"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceArea, CartesianGrid } from "recharts";
import type { DailyLog } from "../lib/daily-log";

type Props = { log: DailyLog };

export default function DailyVitalsChart({ log }: Props) {
  const data = log.vitals.map(v => ({
    time: new Date(v.time).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    HR: v.hr ?? null,
    SpO2: v.spo2 ?? null,
    RR: v.rr ?? null,
    Temp: v.temp ?? null,
  }));

  return (
    <div className="w-full rounded-2xl p-4 shadow-sm border">
      <h3 className="text-lg font-semibold mb-2">バイタル推移（{log.date}）</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          {/* 左軸はHR/RR/Temp、右軸はSpO2 */}
          <YAxis yAxisId="left" domain={[0, 160]} allowDataOverflow />
          <YAxis yAxisId="right" orientation="right" domain={[80, 100]} allowDataOverflow />
          <Tooltip />
          <Legend />
          {/* 参考帯: SpO2 92%未満を可視化（変更可能） */}
          <ReferenceArea yAxisId="right" y1={80} y2={92} fillOpacity={0.08} fill="red" />
          <Line yAxisId="left" type="monotone" dataKey="HR" strokeOpacity={0.9} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="SpO2" strokeOpacity={0.9} dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="RR" strokeOpacity={0.7} strokeDasharray="5 3" dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="Temp" strokeOpacity={0.7} strokeDasharray="2 2" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">
        * 参考帯: SpO2 92%未満は注意。閾値は設定で変更予定。
      </p>
    </div>
  );
}
