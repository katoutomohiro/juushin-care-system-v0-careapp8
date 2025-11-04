export type TimePoint = { t: string; v: number | null };
export type Alert = { t: string; level: 'info' | 'warn' | 'crit'; message: string };

export function movingAverage(series: TimePoint[], window: number): (number | null)[] {
  const out: (number | null)[] = [];
  const buf: number[] = [];
  for (let i = 0; i < series.length; i++) {
    const v = series[i].v;
    if (v != null && Number.isFinite(v)) buf.push(v);
    if (buf.length > window) buf.shift();
    if (buf.length === 0) out.push(null);
    else out.push(buf.reduce((a, b) => a + b, 0) / buf.length);
  }
  return out;
}

export function stddev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function zScores(series: TimePoint[], window: number): (number | null)[] {
  const out: (number | null)[] = [];
  const buf: number[] = [];
  for (let i = 0; i < series.length; i++) {
    const v = series[i].v;
    if (v != null && Number.isFinite(v)) buf.push(v);
    if (buf.length > window) buf.shift();
    if (v == null || !Number.isFinite(v) || buf.length < 2) {
      out.push(null);
      continue;
    }
    const mean = buf.reduce((a, b) => a + b, 0) / buf.length;
    const sd = stddev(buf);
    out.push(sd === 0 ? 0 : (v - mean) / sd);
  }
  return out;
}

export type Thresholds = {
  warnHigh?: number; warnLow?: number;
  critHigh?: number; critLow?: number;
};

export function thresholdAlerts(series: TimePoint[], th: Thresholds): Alert[] {
  const alerts: Alert[] = [];
  for (const p of series) {
    const v = p.v;
    if (v == null) continue;
    if (th.critHigh != null && v >= th.critHigh) alerts.push({ t: p.t, level: 'crit', message: `高値(${v})が危険域 ≥ ${th.critHigh}` });
    else if (th.critLow != null && v <= th.critLow) alerts.push({ t: p.t, level: 'crit', message: `低値(${v})が危険域 ≤ ${th.critLow}` });
    else if (th.warnHigh != null && v >= th.warnHigh) alerts.push({ t: p.t, level: 'warn', message: `高値(${v})が注意域 ≥ ${th.warnHigh}` });
    else if (th.warnLow != null && v <= th.warnLow) alerts.push({ t: p.t, level: 'warn', message: `低値(${v})が注意域 ≤ ${th.warnLow}` });
  }
  return alerts;
}

// Simple hook-like helper usable in components without React dependency
export function analyzeVitals(series: TimePoint[], opts?: { window?: number; thresholds?: Thresholds }) {
  const window = opts?.window ?? 5;
  const ma = movingAverage(series, window);
  const z = zScores(series, window);
  const alerts = thresholdAlerts(series, opts?.thresholds || {});
  return { ma, z, alerts };
}
