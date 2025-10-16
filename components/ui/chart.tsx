"use client";

import * as React from "react";

// ローカル簡易 cn（外部依存を避ける）
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Recharts 側の Tooltip / Legend をそのまま re-export する
// （プロジェクト内で <ChartTooltip .../> / <ChartLegend .../> として使えるように）
export { Tooltip as ChartTooltip, Legend as ChartLegend } from "recharts";

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

/**
 * レイアウト用の薄いラッパー。
 * 依存を極力増やさず、構文・型の安定性を最優先。
 */
export function ChartContainer({ className, children, ...rest }: ChartContainerProps) {
  return (
    <div className={cn("w-full h-full", className)} {...rest}>
      {children}
    </div>
  );
}

type AnyPayload = {
  dataKey?: string;
  name?: string;
  value?: number | string;
  color?: string;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: AnyPayload[];
  label?: string | number;
  valueFormatter?: (v: unknown) => string;
};

/**
 * Recharts Tooltip のカスタム描画。
 * - payload.color をそのまま用いて色スウォッチを表示（inline style は ESLint 既定でエラーにならない）
 * - valueFormatter を渡せば表示を整形
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border bg-white/95 p-2 shadow-md text-sm">
      <div className="font-medium">{String(label ?? "")}</div>
      <ul className="mt-1 space-y-0.5">
        {payload.map((p, i) => (
          <li key={(p.dataKey ?? p.name ?? i).toString()} className="flex items-center gap-2">
            {/* 色スウォッチ */}
            <span
              className="inline-block size-3 rounded"
              style={{ background: p.color ?? "currentColor" }}
              aria-hidden
            />
            <span className="min-w-0 truncate">
              {(p.name ?? p.dataKey ?? "").toString()}
            </span>
            <span className="ml-auto tabular-nums">
              {valueFormatter ? valueFormatter(p.value) : String(p.value ?? "")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ChartLegendContentProps = {
  payload?: AnyPayload[];
};

/**
 * Recharts Legend のカスタム描画。
 */
export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  if (!payload || payload.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {payload.map((p, i) => (
        <div
          key={(p.dataKey ?? p.name ?? i).toString()}
          className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs"
        >
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ background: p.color ?? "currentColor" }}
            aria-hidden
          />
          <span className="truncate max-w-[12rem]">
            {(p.name ?? p.dataKey ?? "").toString()}
          </span>
        </div>
      ))}
    </div>
  );
}
