import React from "react";
import { getAgentSummary, summarizeTodosLocally, type MonthlyReportData } from "../../services/langchain/agent";

// PDF表示用にUIの補助プロパティを任意で許可する拡張型
export type MonthlyReportViewData = MonthlyReportData & {
  userName?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  serviceId?: string;
};

// Async factory that builds a PDF Document for monthly report with AI summary section
export async function generateMonthlyReportPDF(reportData: MonthlyReportViewData): Promise<Blob> {
  const summary = await getAgentSummary(reportData);
  
  // ToDoローカル要約（あれば）
  const todoSummary = reportData.todos && reportData.todos.length > 0
    ? summarizeTodosLocally(reportData.todos)
    : null;

  // 服薬サマリ（あれば整形）
  const med = reportData.medicationSummary;
  const medSummaryText = med
    ? `総数 ${med.total} 件 / 服薬済み ${med.taken} 件 / 未服薬 ${med.missed} 件 / 服薬率 ${med.rate}%`
    : null;

  // アラートサマリ（あれば整形）
  const alert = reportData.alertSummary;
  const alertSummaryText = alert
    ? `・警告日数: ${alert.warnDays}日 / 重大日数: ${alert.criticalDays}日\n・発熱（≥37.5℃）: ${alert.feverDays}日 / 低体温（≤35.5℃）: ${alert.hypothermiaDays}日\n・てんかん発作日: ${alert.seizureDays}日\n・水分不足傾向: ${alert.hydrationLowDays}日`
    : null;

  // 動的インポートで@react-pdf/rendererを読み込み、ビルド時の不要バンドルを回避
  const { Document, Page, Text, pdf } = await import("@react-pdf/renderer");

  const doc = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4" },
      React.createElement(Text, null, "月次報告書"),
      // 利用者名や期間など、呼び出し元で与えられる基本情報（任意）
      React.createElement(Text, null, `氏名: ${reportData.userName ?? ""}`),
      React.createElement(
        Text,
        null,
        `期間: ${reportData.startDate ?? ""} 〜 ${reportData.endDate ?? ""}`
      ),
      // 既存の出力処理（省略）
      React.createElement(Text, { style: { marginTop: 24, fontWeight: 700 } }, "🧠 AIによる要約"),
      React.createElement(Text, null, summary),
      // ToDo要約（あれば表示）
      todoSummary ? React.createElement(Text, { style: { marginTop: 16, fontWeight: 700 } }, "📝 ToDo状況") : null,
      todoSummary ? React.createElement(Text, null, todoSummary) : null
      ,
      // 服薬状況（あれば表示）
      medSummaryText ? React.createElement(Text, { style: { marginTop: 16, fontWeight: 700 } }, "💊 服薬状況") : null,
      medSummaryText ? React.createElement(Text, null, medSummaryText) : null
      ,
      // アラート状況（あれば表示）
      alertSummaryText ? React.createElement(Text, { style: { marginTop: 16, fontWeight: 700 } }, "⚠️ アラート要約") : null,
      alertSummaryText ? React.createElement(Text, null, alertSummaryText) : null
    )
  );

  // React PDFのレンダラでBlob生成
  const blob = await pdf(doc).toBlob();
  return blob;
}
