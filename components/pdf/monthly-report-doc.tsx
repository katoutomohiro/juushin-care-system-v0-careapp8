import React from "react";
import { getAgentSummary, type MonthlyReportData } from "../../services/langchain/agent";

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
      React.createElement(Text, null, summary)
    )
  );

  // React PDFのレンダラでBlob生成
  const blob = await pdf(doc).toBlob();
  return blob;
}
