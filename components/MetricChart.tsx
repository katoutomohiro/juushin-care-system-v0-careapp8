"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type ChartType = "line" | "bar"

type MetricChartProps<T extends Record<string, unknown>> = {
  title: string
  description?: string

  data: T[]
  xKey: keyof T // 例: "date"
  yKey: keyof T // 例: "seizureCount"
  chartType: ChartType // line or bar

  /** 単位などを表示したい時 */
  yLabel?: string

  /** 値がnull/undefinedのときの扱い（基本は0に寄せるとグラフが崩れにくい） */
  normalizeY?: (v: unknown) => number

  /** 縦幅 */
  height?: number

  /** ラベルを短くする等 */
  formatX?: (v: unknown) => string

  /** Tooltip表示の整形 */
  formatTooltipValue?: (v: unknown) => string
}

export function MetricChart<T extends Record<string, unknown>>(
  props: MetricChartProps<T>
) {
  const {
    title,
    description,
    data,
    xKey,
    yKey,
    chartType,
    yLabel,
    normalizeY = (v) => (v == null ? 0 : Number(v)),
    height = 260,
    formatX = (v) => String(v),
    formatTooltipValue = (v) => String(v),
  } = props

  // recharts用に yKey を必ず number に寄せる（nullが混ざるとSonar的にも微妙だし描画も崩れる）
  const chartData = React.useMemo(() => {
    return (data ?? []).map((row) => ({
      ...row,
      __y: normalizeY((row[xKey as string] as unknown) ?? undefined),
      __x: row[xKey as string],
    }))
  }, [data, xKey, yKey, normalizeY])

  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="mb-3">
        <div className="text-base font-semibold">{title}</div>
        {description ? <div className="text-sm text-gray-500">{description}</div> : null}
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="__x" tickFormatter={(v) => formatX(v)} />
              <YAxis />
              <Tooltip
                formatter={(value: unknown) => formatTooltipValue(value)}
                labelFormatter={(label: unknown) => formatX(label)}
              />
              <Line type="monotone" dataKey="__y" dot={false} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="__x" tickFormatter={(v) => formatX(v)} />
              <YAxis />
              <Tooltip
                formatter={(value: unknown) => formatTooltipValue(value)}
                labelFormatter={(label: unknown) => formatX(label)}
              />
              <Bar dataKey="__y" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {yLabel ? <div className="mt-2 text-xs text-gray-500">単位: {yLabel}</div> : null}
    </section>
  )
}
