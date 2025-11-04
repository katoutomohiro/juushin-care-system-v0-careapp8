import { z } from "zod";
import { createChatModel } from "../../config/langchain";

// Minimal input contract for monthly report to avoid cross-module coupling
export type MonthlyReportData = {
  ym: string;
  totals: {
    entries: number;
    seizureCount: number;
    avgHeartRate: number | null;
    avgTemperature: number | null;
    avgSpO2: number | null;
  };
  days: Array<{ date: string; hr: number | null; temp: number | null; spO2: number | null; seizure: number }>;
  todos?: TodoLite[]; // Optional: ToDo情報を含める
  medicationSummary?: MedicationSummary; // Optional: 服薬統計
  alertSummary?: AlertSummary; // Optional: アラート統計
};

// --- Optional: ToDo関連の要約スロット（将来の統合用のプレースホルダ） ---
export type TodoLite = { id: string; title: string; completed: boolean; dueDate?: string; priority?: string };

export type MedicationSummary = {
  total: number;
  taken: number;
  missed: number;
  rate: number; // %
};

export type AlertSummary = {
  warnDays: number;
  criticalDays: number;
  feverDays: number;
  hypothermiaDays: number;
  seizureDays: number;
  hydrationLowDays: number;
};

export type SummaryResult = {
  summary: string;
  highlights: string[];
  metrics: {
    entries: number;
    seizureCount: number;
    avgHeartRate: number | null;
    avgTemperature: number | null;
    avgSpO2: number | null;
  };
  model?: string;
};

const SummarySchema = z.object({
  summary: z.string(),
  highlights: z.array(z.string()).default([]),
});

function buildPrompt(report: MonthlyReportData) {
  const { totals, ym, todos, medicationSummary, alertSummary } = report;
  const header = `以下は月次ケアレポート(${ym})の要約対象データです。`;
  const instructions = [
    "日本語で、臨床現場の家族・スタッフ向けに、平易で丁寧な自然文の要約を書いてください。",
    "1段落の要約(summary)と、3〜6項目の箇条書き(hightlights)を返してください。",
    "必ず次のJSON形式のみで応答してください: { \"summary\": string, \"highlights\": string[] }",
    "重要: JSON以外の文字を含めないでください。コードブロックも不要です。",
  ].join("\n");

  const compact: any = {
    ym,
    totals,
    daysPreview: report.days.slice(0, 7), // LLMへの入力サイズを抑える
  };

  // ToDoがあれば含める
  if (todos && todos.length > 0) {
    const total = todos.length;
    const done = todos.filter(t => t.completed).length;
    const pending = total - done;
    const today = new Date().toISOString().slice(0, 10);
    const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;
    compact.todos = {
      total,
      completed: done,
      pending,
      overdue,
      sample: todos.slice(0, 3).map(t => ({ title: t.title, completed: t.completed, dueDate: t.dueDate })),
    };
  }

  // 服薬サマリがあれば含める
  if (medicationSummary) {
    compact.medications = medicationSummary;
  }

  // アラートサマリがあれば含める
  if (alertSummary) {
    compact.alerts = alertSummary;
  }

  return [
    "[SYSTEM] あなたは重症児者ケアの記録から安全で配慮のある自然言語要約を作成する専門家です。",
    "推測は避け、事実ベースで、否定的な表現は避けて前向きに書きます。",
    "数値は小数1桁までに丸め、単位は適切に省略しても構いません。",
    "",
    `[USER] ${header}`,
    "要約方針:\n- バイタル平均(心拍/体温/SpO2)、発作頻度、全体傾向、注意点、推奨事項に触れる",
    todos && todos.length > 0 ? "- ToDoの状況（完了・未完了・期限切れ）も簡潔に含める" : "",
    medicationSummary ? "- 服薬状況（総数/服薬済み/未服薬/服薬率）も簡潔に含める" : "",
    alertSummary ? "- アラート傾向（警告日数/重大日数/発熱/低体温/てんかん）も簡潔に含める" : "",
    "",
    "データ(JSON):",
    JSON.stringify(compact),
    "",
    instructions,
  ].filter(Boolean).join("\n");
}

export async function summarizeMonthlyReport(
  report: MonthlyReportData
): Promise<SummaryResult> {
  const model = createChatModel();
  let raw: string;
  try {
    const promptText = buildPrompt(report);
    // 文字列プロンプトで直接呼び出す（追加の@langchain/core依存を避ける）
    const resp = await model.invoke(promptText);
    // respはAIMessageの可能性があるが、toString安全化
    raw = (resp as any)?.content ?? String(resp ?? "");
  } catch {
    // ネットワークやAPIキーが無い等の例外時は、最低限のルールベース概要を返す
    const t = report.totals;
    const summary = `今月(${report.ym})は記録${t.entries}件、発作${t.seizureCount}回。平均HR ${
      t.avgHeartRate ?? "-"
    }、平均体温 ${t.avgTemperature ?? "-"}、平均SpO2 ${
      t.avgSpO2 ?? "-"
    }。AI要約は現在利用できないため、統計値のみの簡易要約です。`;
    return {
      summary,
      highlights: [
        `発作頻度: ${t.seizureCount}回`,
        `HR平均: ${t.avgHeartRate ?? "-"}`,
        `体温平均: ${t.avgTemperature ?? "-"}`,
        `SpO2平均: ${t.avgSpO2 ?? "-"}`,
      ],
      metrics: { ...report.totals },
      model: "fallback-rule",
    };
  }

  // try parse JSON
  let parsed: { summary: string; highlights: string[] } | null = null;
  try {
    parsed = SummarySchema.parse(JSON.parse(raw));
  } catch {
    // モデルがプレーンテキストで返した場合に備えたフォールバック
    parsed = { summary: String(raw || ""), highlights: [] };
  }

  return {
    ...parsed,
    metrics: { ...report.totals },
    model: (model as any).model ?? undefined,
  } as SummaryResult;
}

// Convenience wrapper to return only summary text for simple consumers (e.g., PDF rendering)
export async function getAgentSummary(report: MonthlyReportData): Promise<string> {
  const result = await summarizeMonthlyReport(report);
  return result.summary;
}

/**
 * 将来的にLangChainでの要約へ差し替える前提の軽量版。
 * 現状はローカル集計で、完了数/未完了数、期限切れの数などを要約テキストにする。
 */
export function summarizeTodosLocally(todos: TodoLite[]): string {
  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  const pending = total - done;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;
  return `ToDo ${total}件（完了${done}・未完了${pending}）。期限切れ ${overdue} 件。`;
}

/**
 * 服薬データのローカル集計。将来的にLangChain統合するまでの軽量版。
 */
export function summarizeMedications(meds: Array<{ taken?: boolean }> | null | undefined): MedicationSummary {
  if (!Array.isArray(meds)) return { total: 0, taken: 0, missed: 0, rate: 0 };
  const total = meds.length;
  const taken = meds.filter(m => !!m?.taken).length;
  const missed = total - taken;
  const rate = total > 0 ? Math.round((taken / total) * 1000) / 10 : 0;
  return { total, taken, missed, rate };
}
