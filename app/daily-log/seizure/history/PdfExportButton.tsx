"use client"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { SeizureLog } from "@/lib/persistence/seizure"

const styles = StyleSheet.create({
  page: { padding: 24 },
  title: { fontSize: 18, marginBottom: 12 },
  row: { flexDirection: "row", borderBottom: 1, borderColor: "#ccc", paddingVertical: 4 },
  cell: { fontSize: 10, paddingRight: 8, flexGrow: 1 },
})

function LogsPdf({ logs }: { logs: SeizureLog[] }) {
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "-"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m > 0) return `${m}分${s}秒`
    return `${s}秒`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>発作記録 一覧（先頭 {Math.min(20, logs.length)} 件）</Text>
        <View>
          {logs.slice(0, 20).map((l) => (
            <View key={l.id} style={styles.row}>
              <Text style={[styles.cell, { flexBasis: 120 }]}> {new Date(l.occurredAt).toLocaleString("ja-JP")} </Text>
              <Text style={styles.cell}>{l.seizureType}</Text>
              <Text style={styles.cell}>{formatDuration(l.duration)}</Text>
              <Text style={styles.cell}>{l.trigger || "-"}</Text>
              <Text style={styles.cell}>{l.intervention || "-"}</Text>
              <Text style={[styles.cell, { flexBasis: 160 }]}>{l.note || ""}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export default function PdfExportButton({ logs }: { logs: SeizureLog[] }) {
  return (
    <PDFDownloadLink document={<LogsPdf logs={logs} />} fileName={`seizure_logs_${Date.now()}.pdf`}>
      {({ loading }: any) => <Button variant="outline">{loading ? "PDF生成中…" : "PDF"}</Button>}
    </PDFDownloadLink>
  )
}
