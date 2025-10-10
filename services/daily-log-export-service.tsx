import { pdf } from "@react-pdf/renderer"
import { DailyLogPdfDoc } from "@/components/pdf/daily-log-pdf-doc"

export class DailyLogExportService {
  static async generatePdfBlob(dailyLog: any, careEvents: any[]): Promise<Blob> {
    try {
      const doc = <DailyLogPdfDoc dailyLog={dailyLog} careEvents={careEvents} />
      const blob = await pdf(doc).toBlob()

      return blob
    } catch (error) {
      console.error("PDF generation error:", error)
      throw new Error("PDF生成に失敗しました")
    }
  }

  static async downloadPdf(dailyLog: any, careEvents: any[]): Promise<void> {
    try {
      const blob = await this.generatePdfBlob(dailyLog, careEvents)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `daily-log-${dailyLog.user}-${dailyLog.date.replace(/\//g, "-")}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("PDF download error:", error)
      throw error
    }
  }

  static async exportToCsv(dailyLog: any, careEvents: any[]): Promise<void> {
    try {
      let csvContent = "日常ケア記録レポート\n\n"
      csvContent += `利用者,${dailyLog.user}\n`
      csvContent += `記録日,${dailyLog.date}\n`
      csvContent += `生成日時,${new Date().toLocaleString("ja-JP")}\n\n`

      csvContent += "記録サマリー\n"
      csvContent += "ケア項目,記録回数,最終記録時刻\n"

      dailyLog.events.forEach((event: any) => {
        csvContent += `${event.name},${event.count},${event.lastRecorded}\n`
      })

      csvContent += "\n詳細記録\n"
      csvContent += "記録時刻,ケア項目,詳細情報,備考\n"

      const todayEvents = careEvents.filter((event: any) => {
        const eventDate = new Date(event.timestamp).toDateString()
        const today = new Date().toDateString()
        return eventDate === today
      })

      todayEvents.forEach((event: any) => {
        const time = new Date(event.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
        const eventName = this.getEventTypeName(event.eventType)
        const details = this.formatEventDetails(event).replace(/,/g, "；")
        const notes = (event.notes || "").replace(/,/g, "；")
        csvContent += `${time},${eventName},"${details}","${notes}"\n`
      })

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `daily-log-${dailyLog.user}-${dailyLog.date.replace(/\//g, "-")}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("CSV export error:", error)
      throw new Error("CSV出力に失敗しました")
    }
  }

  private static getEventTypeName(eventType: string): string {
    const typeNames: { [key: string]: string } = {
      seizure: "発作記録",
      expression: "表情・反応",
      vitals: "バイタルサイン",
      hydration: "水分補給",
      excretion: "排泄",
      activity: "活動",
      skin_oral_care: "皮膚・口腔ケア",
      tube_feeding: "経管栄養",
    }
    return typeNames[eventType] || eventType
  }

  private static formatEventDetails(event: any): string {
    switch (event.eventType) {
      case "seizure":
        return `種類: ${event.type || "未記録"}, 持続時間: ${event.duration || "未記録"}秒, 重症度: ${event.severity || "未記録"}`
      case "vitals":
        return `体温: ${event.temperature || "未記録"}℃, 血圧: ${event.bloodPressureSystolic || "未記録"}/${event.bloodPressureDiastolic || "未記録"}, 心拍数: ${event.heartRate || "未記録"}回/分`
      case "hydration":
        return `水分量: ${event.amount || "未記録"}ml, 種類: ${event.fluidType || "未記録"}, 方法: ${event.method || "未記録"}`
      case "tube_feeding":
        return `注入量: ${event.amount || "未記録"}ml, 栄養剤: ${event.nutritionBrand || "未記録"}, 方法: ${event.infusionMethod || "未記録"}`
      default:
        return "詳細情報なし"
    }
  }

  static generateDailyLogFromStorage(selectedUser: string): any {
    const careEvents = JSON.parse(localStorage.getItem("careEvents") || "[]")
    const todayEvents = careEvents.filter((event: any) => {
      const eventDate = new Date(event.timestamp).toDateString()
      const today = new Date().toDateString()
      return eventDate === today
    })

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
