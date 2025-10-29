"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { registerNotoIfNeeded } from "@/lib/pdf/registerFonts";

export type PdfColumn<T> = {
  key: keyof T | string;   // ネストは "a.b" 文字列でOK
  header: string;
  width?: number;          // 相対幅（未指定なら自動）
  map?: (value: any, row: T) => string; // 表示用整形
};

export type ExportAsPdfOptions<T> = {
  title?: string;
  filename?: string; // .pdf なしでもOK
  maskFields?: string[]; // ["freeText", "memo"] 等
  rowMapper?: (row: T) => T; // 前処理フック（任意）
  pageSize?: "A4" | "LETTER";
};

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: "NotoSansJP", fontSize: 11 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  table: { display: "flex" as const, width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  row: { flexDirection: "row" },
  cell: { borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 4, justifyContent: "center" },
  th: { fontWeight: "bold" },
});

function getByPath(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

function stringify(v: any) {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** テストしやすい純関数: マスク＆整形 → 2次元配列 */
export function toTableData<T>(
  rows: T[],
  columns: PdfColumn<T>[],
  opts: Pick<ExportAsPdfOptions<T>, "maskFields" | "rowMapper">
): { headers: string[]; body: string[][] } {
  const headers = columns.map((c) => c.header);
  const masked = rows.map((r) => (opts.rowMapper ? opts.rowMapper(r) : r));
  const body = masked.map((row) =>
    columns.map((c) => {
      const key = String(c.key);
      const raw = getByPath(row as any, key);
      const masked =
        opts.maskFields && opts.maskFields.includes(key) ? "***" : raw;
      return c.map ? c.map(masked, row) : stringify(masked);
    })
  );
  return { headers, body };
}

export async function exportAsPdf<T>(
  rows: T[],
  columns: PdfColumn<T>[],
  options: ExportAsPdfOptions<T> = {}
) {
  if (!rows || rows.length === 0) {
    // 空でもタイトル＋ヘッダのみ出す仕様にしておく
  }
  registerNotoIfNeeded();

  const { headers, body } = toTableData(rows, columns, {
    maskFields: options.maskFields,
    rowMapper: options.rowMapper,
  });

  const widths = columns.map((c) => c.width || 1);
  const total = widths.reduce((a, b) => a + b, 0);

  const Doc = (
    <Document>
      <Page size={options.pageSize || "A4"} style={styles.page}>
        {options.title && <Text style={styles.title}>{options.title}</Text>}
        <View style={styles.table}>
          {/* header */}
          <View style={styles.row}>
            {headers.map((h, i) => (
              <View key={`h-${i}`} style={[styles.cell, { width: `${(widths[i] / total) * 100}%` }]}>
                <Text style={styles.th}>{h}</Text>
              </View>
            ))}
          </View>
          {/* body */}
          {body.map((row, r) => (
            <View key={`r-${r}`} style={styles.row}>
              {row.map((cell, c) => (
                <View key={`c-${r}-${c}`} style={[styles.cell, { width: `${(widths[c] / total) * 100}%` }]}>
                  <Text>{cell}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(Doc).toBlob();
  const filename = (options.filename || "export") + (options.filename?.endsWith(".pdf") ? "" : ".pdf");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
