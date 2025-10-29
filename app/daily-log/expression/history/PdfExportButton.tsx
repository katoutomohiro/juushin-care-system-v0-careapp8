"use client"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { ExpressionLog } from "@/lib/persistence/expression"

const styles = StyleSheet.create({
  page: { padding: 24 },
  title: { fontSize: 18, marginBottom: 12 },
  row: { flexDirection: "row", borderBottom: 1, borderColor: "#ccc", paddingVertical: 4 },
  cell: { fontSize: 10, paddingRight: 8, flexGrow: 1 },
})

function LogsPdf({ logs }: { logs: ExpressionLog[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>表情・反応記録 一覧（先頭 {Math.min(20, logs.length)} 件）</Text>
        <View>
          {logs.slice(0, 20).map((l) => (
            <View key={l.id} style={styles.row}>
              <Text style={[styles.cell, { flexBasis: 120 }]}> {new Date(l.occurredAt).toLocaleString("ja-JP")} </Text>
              <Text style={styles.cell}>{l.expression}</Text>
              <Text style={styles.cell}>{l.reaction || "-"}</Text>
              <Text style={styles.cell}>{l.intervention || "-"}</Text>
              <Text style={styles.cell}>{l.discomfort || "-"}</Text>
              <Text style={[styles.cell, { flexBasis: 160 }]}>{l.note || ""}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export default function PdfExportButton({ logs }: { logs: ExpressionLog[] }) {
  return (
    <PDFDownloadLink document={<LogsPdf logs={logs} />} fileName={`expression_logs_${Date.now()}.pdf`}>
      {({ loading }: any) => <Button variant="outline">{loading ? "PDF生成中…" : "PDF"}</Button>}
    </PDFDownloadLink>
  )
}
