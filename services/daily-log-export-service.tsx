import { pdf } from "@react-pdf/renderer"

import { DailyLogPdfDoc } from "@/components/pdf/daily-log-pdf-doc"
import { getStoredUserId } from "@/contexts/user-context"
import { exportAsCsvV2, type CsvColumn } from "@/lib/exporter/csv"
import { db } from "@/lib/db"
import { computeDailyAlertsDay } from "@/services/alerts/computeDailyAlertsDay"
import {
  alertCsvColumns,
  summarizeAlertsForDate,
  type AlertCsvRow,
} from "@/services/csv/alerts-csv"

type AlertColumnFields = Pick<AlertCsvRow, "alerts_critical_count" | "alerts_warn_count" | "latest_alert_titles">

type DailyLogCsvRow = {
  date: string
  userId: string
  eventTime: string
  eventType: string
  detail: string
  notes: string
} & Partial<AlertColumnFields>

export class DailyLogExportService {
  static async generatePdfBlob(dailyLog: any, careEvents: any[]): Promise<Blob> {
    try {
      const doc = <DailyLogPdfDoc dailyLog={dailyLog} careEvents={careEvents} />
      return await pdf(doc).toBlob()
    } catch (error) {
      console.error("PDF generation error:", error)
      throw new Error("PDF生成に失敗しました")
    }
  }

  static async downloadPdf(dailyLog: any, careEvents: any[]): Promise<void> {
    try {
      const blob = await this.generatePdfBlob(dailyLog, careEvents)
      const url = URL.createObjectURL(blob)
      this.downloadFromUrl(url, `daily-log-${dailyLog.user}-${dailyLog.date.replace(/\//g, "-")}.pdf`)
    } catch (error) {
      console.error("PDF download error:", error)
      throw error
    }
  }

  static async exportToCsv(
    dailyLog: any,
    careEvents: any[],
    options: { includeAlerts?: boolean } = {},
  ): Promise<void> {
    try {
      const userId = getStoredUserId()
      const isoDate = this.normalizeDate(dailyLog?.date)
      const eventsForDate = this.filterEventsByDate(careEvents, isoDate)

      const baseColumns: CsvColumn<DailyLogCsvRow>[] = [
        { key: "date", header: "date" },
        { key: "userId", header: "user_id" },
        { key: "eventTime", header: "event_time" },
        { key: "eventType", header: "event_type" },
        { key: "detail", header: "detail" },
        { key: "notes", header: "notes" },
      ]

      let columns: CsvColumn<DailyLogCsvRow>[] = [...baseColumns]
      let alertFields: Partial<AlertColumnFields> = {}

      if (options.includeAlerts) {
        await computeDailyAlertsDay(userId, isoDate)
        const alerts = await db.alerts.where("userId").equals(userId).and((a) => a.date === isoDate).toArray()
        const summary = summarizeAlertsForDate(alerts as any, isoDate)
        alertFields = {
          alerts_critical_count: summary.alerts_critical_count,
          alerts_warn_count: summary.alerts_warn_count,
          latest_alert_titles: summary.latest_alert_titles,
        }
        columns = [...columns, ...alertCsvColumns<DailyLogCsvRow>()]
      }

      const rows: DailyLogCsvRow[] =
        eventsForDate.length > 0
          ? eventsForDate.map((event: any) => ({
              date: isoDate,
              userId,
              eventTime: this.formatEventTime(event.timestamp),
              eventType: this.getEventTypeName(event.eventType),
              detail: this.formatEventDetails(event),
              notes: this.formatNotes(event.notes),
              ...alertFields,
            }))
          : [
              {
                date: isoDate,
                userId,
                eventTime: "",
                eventType: "記録なし",
                detail: "",
                notes: "",
                ...alertFields,
              },
            ]

      const url = exportAsCsvV2(rows, columns, {
        rowMapper: (row) => ({
          ...row,
          detail: this.sanitize(row.detail),
          notes: this.sanitize(row.notes),
        }),
      })

      const filename = `daily-log-${dailyLog?.user ?? userId}-${isoDate}.csv`
      this.downloadFromUrl(url, filename)
    } catch (error) {
      console.error("CSV export error:", error)
      throw new Error("CSV出力に失敗しました")
    }
  }

  private static downloadFromUrl(url: string, filename: string) {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  private static normalizeDate(value?: string): string {
    if (!value) return new Date().toISOString().slice(0, 10)
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(value)) {
      return value.replace(/\//g, "-")
    }
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
    return new Date().toISOString().slice(0, 10)
  }

  private static filterEventsByDate(events: any[], isoDate: string) {
    return events.filter((event) => {
      const timestamp = event?.timestamp ?? event?.occurredAt ?? event?.date
      if (!timestamp) return false
      const date = new Date(timestamp)
      if (Number.isNaN(date.getTime())) return false
      return date.toISOString().slice(0, 10) === isoDate
    })
  }

  private static formatEventTime(timestamp: any): string {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
  }

  private static sanitize(value: string): string {
    return value.replace(/\r?\n/g, " ")
  }

  private static formatNotes(notes: any): string {
    if (notes == null) return ""
    return this.sanitize(String(notes))
  }

  private static getEventTypeName(eventType: string): string {
    const typeNames: Record<string, string> = {
      seizure: "発作記録",
      expression: "表情・反応",
      vitals: "バイタルサイン",
      hydration: "水分補給",
      excretion: "排泄",
      activity: "活動",
      skin_oral_care: "皮膚・口腔ケア",
      tube_feeding: "経管栄養",
      respiratory: "呼吸管理",
      positioning: "体位変換・姿勢管理",
      swallowing: "摂食嚥下管理",
      "infection-prevention": "感染予防管理",
      communication: "コミュニケーション支援",
      transportation: "送迎",
    }
    return typeNames[eventType] ?? eventType
  }

  private static formatEventDetails(event: any): string {
    switch (event?.eventType) {
      case "seizure":
        return `種類: ${event.type ?? "未記録"}, 持続時間: ${event.duration ?? "未記録"}分, 重症度: ${event.severity ?? "未記録"}`
      case "vitals":
        return `体温: ${event.temperature ?? "未記録"}℃, 血圧: ${event.bloodPressureSystolic ?? "未記録"}/${event.bloodPressureDiastolic ?? "未記録"}, 脈拍: ${event.heartRate ?? "未記録"}`
      case "hydration":
        return `水分量: ${event.amount ?? "未記録"}ml, 種類: ${event.fluidType ?? "未記録"}, 方法: ${event.method ?? "未記録"}`
      case "tube_feeding":
        return `注入量: ${event.amount ?? "未記録"}ml, 栄養剤: ${event.nutritionBrand ?? "未記録"}, 方法: ${event.infusionMethod ?? "未記録"}`
      case "respiratory":
        return `酸素濃度: ${event.oxygenSaturation ?? "未記録"}%, 呼吸数: ${event.respiratoryRate ?? "未記録"}`
      case "positioning":
        return `体位: ${event.position ?? "未記録"}, 所要時間: ${event.duration ?? "未記録"}分`
      case "swallowing":
        return `食形態: ${event.foodTexture ?? "未記録"}, 誤嚥リスク: ${event.risk ?? "未評価"}`
      case "infection-prevention":
        return `実施内容: ${event.action ?? "未記録"}, 装備: ${event.equipment ?? "未記録"}`
      case "communication":
        return `支援内容: ${event.support ?? "未記録"}, 反応: ${event.response ?? "未記録"}`
      default:
        return event?.details ? String(event.details) : "詳細不明"
    }
  }

  static generateDailyLogFromStorage(selectedUser: string): any {
    const careEvents = JSON.parse(localStorage.getItem("careEvents") || "[]")
    const todayIso = new Date().toISOString().slice(0, 10)
    const todayEvents = this.filterEventsByDate(careEvents, todayIso)

    const eventCategories = [
      { id: "seizure", name: "発作記録" },
      { id: "expression", name: "表情・反応" },
      { id: "vitals", name: "バイタル" },
      { id: "hydration", name: "水分補給" },
      { id: "excretion", name: "排泄" },
      { id: "activity", name: "活動" },
      { id: "skin_oral_care", name: "皮膚・口腔ケア" },
      { id: "tube_feeding", name: "経管栄養" },
    ]

    return {
      user: selectedUser,
      date: new Date().toLocaleDateString("ja-JP"),
      events: eventCategories.map((category) => {
        const categoryEvents = todayEvents.filter((event: any) => event.eventType === category.id)
        return {
          type: category.id,
          name: category.name,
          count: categoryEvents.length,
          lastRecorded:
            categoryEvents.length > 0
              ? new Date(categoryEvents[categoryEvents.length - 1].timestamp).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "未記録",
        }
      }),
    }
  }
}
