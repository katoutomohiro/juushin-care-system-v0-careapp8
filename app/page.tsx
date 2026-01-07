"use client"

export const dynamic = "force-dynamic"

import { Card } from "@/components/ui/card"
import { useState, useEffect, useCallback } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n-client"
import { PdfPreviewModal } from "@/components/pdf/pdf-preview-modal"
import { DataBackupPanel } from "@/components/data-backup-panel"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { SettingsPanel } from "@/components/settings-panel"
import { A4RecordSheet } from "@/components/a4-record-sheet"
import { DailyLogExportService } from "@/services/daily-log-export-service"
import { DataStorageService } from "@/services/data-storage-service"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AdminPasswordAuth } from "@/components/admin-password-auth"
import { ClickableCard } from "@/components/ui/clickable-card"
import { useRouter } from "next/navigation"
import { composeA4Record } from "@/services/a4-mapping"
import type { CareEvent } from "@/types/care-event"

const eventCategories = [
  {
    id: "seizure",
    name: "発作記録",
    icon: "⚡",
    color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    iconBg: "bg-red-100 text-red-600",
    description: "発作の種類・時間・対応を記録",
  },
  {
    id: "expression",
    name: "表情・反応",
    icon: "😊",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
    description: "表情や反応の変化を記録",
  },
  {
    id: "vitals",
    name: "バイタル",
    icon: "❤️",
    color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    iconBg: "bg-rose-100 text-rose-600",
    description: "体温・血圧・脈拍を記録",
  },
  {
    id: "hydration",
    name: "水分補給",
    icon: "💧",
    color: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
    iconBg: "bg-sky-100 text-sky-600",
    description: "水分摂取量・方法を記録",
  },
  {
    id: "excretion",
    name: "排泄",
    icon: "🚽",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-600",
    description: "排尿・排便の状況を記録",
  },
  {
    id: "activity",
    name: "活動",
    icon: "🏃",
    color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
    iconBg: "bg-violet-100 text-violet-600",
    description: "日常活動・リハビリを記録",
  },
  {
    id: "skin_oral_care",
    name: "皮膚・口腔ケア",
    icon: "🛡️",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    iconBg: "bg-indigo-100 text-indigo-600",
    description: "皮膚状態・口腔ケアを記録",
  },
  {
    id: "tube_feeding",
    name: "経管栄養",
    icon: "🍽️",
    color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    iconBg: "bg-orange-100 text-orange-600",
    description: "経管栄養の実施状況を記録",
  },
  {
    id: "respiratory",
    name: "呼吸管理",
    icon: "🫁",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
    iconBg: "bg-cyan-100 text-cyan-600",
    description: "呼吸状態・人工呼吸器管理を記録",
  },
  {
    id: "positioning",
    name: "体位変換・姿勢管理",
    icon: "🔄",
    color: "bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100",
    iconBg: "bg-lime-100 text-lime-600",
    description: "体位変換・姿勢調整を記録",
  },
  {
    id: "swallowing",
    name: "摂食嚥下管理",
    icon: "🍽️",
    color: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
    iconBg: "bg-pink-100 text-pink-600",
    description: "嚥下機能・誤嚥リスク管理を記録",
  },
  {
    id: "infection-prevention",
    name: "感染予防管理",
    icon: "🛡️",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    iconBg: "bg-yellow-100 text-yellow-600",
    description: "感染兆候・予防策実施を記録",
  },
  {
    id: "communication",
    name: "コミュニケーション支援",
    icon: "💬",
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    iconBg: "bg-purple-100 text-purple-600",
    description: "意思疎通・支援機器使用を記録",
  },
]

const users = [
  "利用者A",
  "利用者B",
  "利用者C",
  "利用者D",
  "利用者E",
  "利用者F",
  "利用者G",
  "利用者H",
  "利用者I",
  "利用者J",
  "利用者K",
  "利用者L",
  "利用者M",
  "利用者N",
  "利用者O",
  "利用者P",
  "利用者Q",
  "利用者R",
  "利用者S",
  "利用者T",
  "利用者U",
  "利用者V",
  "利用者W",
  "利用者X",
]

const welfareServices = [
  {
    id: "life-care",
    name: "生活介護",
    icon: "🏥",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    description: "日中活動・創作活動・生産活動の記録と支援計画管理",
    features: ["個別支援計画", "活動記録", "健康管理", "家族連携"],
  },
  {
    id: "after-school",
    name: "放課後等デイサービス",
    icon: "🎓",
    color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    description: "学齢期の療育・集団活動・個別支援の記録",
    features: ["療育プログラム", "発達支援", "学習支援", "社会性育成"],
  },
  {
    id: "day-support",
    name: "日中一時支援",
    icon: "⏰",
    color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    description: "短期預かり・見守り支援の状況記録",
    features: ["安全管理", "活動支援", "緊急対応", "家族支援"],
  },
  {
    id: "group-home",
    name: "グループホーム",
    icon: "🏠",
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    description: "共同生活援助・夜間支援・生活相談の記録",
    features: ["生活支援", "夜間ケア", "自立支援", "地域連携"],
  },
  {
    id: "home-care",
    name: "重度訪問介護",
    icon: "🚑",
    color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    description: "在宅支援・外出支援・身体介護の記録",
    features: ["身体介護", "家事支援", "外出支援", "医療連携"],
  },
]

// 明示的なサービスID→ルートのマッピング（SSR/CSR差が出ない純粋な定数）
const SERVICE_ROUTE_MAP = {
  "life-care": "/services/life-care",
  "after-school": "/services/after-school",
  "day-support": "/services/day-support",
  "group-home": "/services/group-home",
  "home-care": "/services/home-care",
} as const

const _enhancedEventCategories = [
  ...eventCategories,
  {
    id: "medication",
    name: "服薬管理",
    icon: "💊",
    color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
    iconBg: "bg-teal-100 text-teal-600",
    description: "処方薬の服薬状況・副作用・効果の記録",
  },
  {
    id: "therapy",
    name: "リハビリテーション",
    icon: "🏃‍♂️",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    iconBg: "bg-indigo-100 text-indigo-600",
    description: "理学療法・作業療法・言語療法の実施記録",
  },
  {
    id: "family-communication",
    name: "家族連携",
    icon: "👨‍👩‍👧‍👦",
    color: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
    iconBg: "bg-pink-100 text-pink-600",
    description: "家族との情報共有・相談・支援計画の調整",
  },
]

export default function WorldClassSoulCareApp() {
  const [customUserNames, setCustomUserNames] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("利用者A")
  const [dailyLog, setDailyLog] = useState<Record<string, unknown> | null>(null)
  const [_isModalOpen, _setIsModalOpen] = useState(false)
  const [_currentFormType, _setCurrentFormType] = useState<string | null>(null)
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [isA4RecordSheetOpen, setIsA4RecordSheetOpen] = useState(false)
  const [careEvents, setCareEvents] = useState<CareEvent[]>([])
  const [currentView, setCurrentView] = useState<"dashboard" | "statistics" | "settings">("dashboard")
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [serviceType, setServiceType] = useState<string>("")
  const [displayDate, setDisplayDate] = useState<string>("—")
  const [a4RecordDate, setA4RecordDate] = useState<string>("—")
  const _router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  // サービス選択時に即遷移（未選択は何もしない）
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setServiceType(value)
    if (!value) return
    const route = SERVICE_ROUTE_MAP[value as keyof typeof SERVICE_ROUTE_MAP]
    if (route) {
      // 遷移が発生する場合のみ、表示を未選択に戻す
      setServiceType("")
      _router.push(route)
    }
  }

  // Initialize date display on client side only to avoid SSR/CSR mismatch
  useEffect(() => {
    setDisplayDate(
      new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    )
    setA4RecordDate(new Date().toLocaleDateString("ja-JP"))
  }, [])

  useEffect(() => {
    const savedUserNames = DataStorageService.getCustomUserNames()
    if (savedUserNames.length > 0) {
      setCustomUserNames(savedUserNames)
      // Update selected user if current selection doesn't exist in custom names
      if (!savedUserNames.includes(selectedUser)) {
        setSelectedUser(savedUserNames[0] || "利用者A")
      }
    } else {
      setCustomUserNames(users)
    }
  }, [selectedUser])

  const generateDailyLog = useCallback(() => {
    const events = DataStorageService.getCareEventsByUser(selectedUser)
    setCareEvents(events)
    const log = DailyLogExportService.generateDailyLogFromStorage(selectedUser)
    setDailyLog(log)
  }, [selectedUser])

  const _handleFormSubmit = (data: Record<string, unknown>) => {
    console.log("[v0] Form submitted:", data)
    toast({
      variant: "default",
      title: "記録を保存しました",
      description: `${data.eventType}の記録が正常に保存されました`,
    })
    generateDailyLog() // Refresh the daily log
  }

  const handlePdfPreview = useCallback(() => {
    setIsLoading(true)
    try {
      generateDailyLog()
      setIsPdfPreviewOpen(true)
      console.log("[v0] Opening PDF preview modal")
      toast({
        variant: "default",
        title: "PDF プレビューを開きました",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "PDF プレビューの生成に失敗しました",
        description: "もう一度お試しください",
      })
    } finally {
      setIsLoading(false)
    }
  }, [generateDailyLog, toast])

  const [includeAlerts, setIncludeAlerts] = useState(false)

  const handleExcelExport = useCallback(async () => {
    try {
      setIsExporting(true)
      generateDailyLog()
      console.log("[v0] Starting CSV export with data:", { dailyLog, careEvents })
      console.time("[v0] CSV Export Handler")

      await DailyLogExportService.exportToCsv(dailyLog, careEvents, { includeAlerts })

      console.timeEnd("[v0] CSV Export Handler")
      console.log("[v0] CSV export completed successfully")
      toast({
        variant: "default",
        title: "CSV出力が完了しました",
        description: "ファイルがダウンロードされました",
      })
    } catch (error) {
      console.error("[v0] CSV export failed:", error)
      toast({
        variant: "destructive",
        title: "CSV出力に失敗しました",
        description: "もう一度お試しください",
      })
    } finally {
      setIsExporting(false)
    }
  }, [generateDailyLog, dailyLog, careEvents, toast, includeAlerts])

  const handleA4RecordSheetPreview = useCallback(() => {
    setIsLoading(true)
    try {
      generateDailyLog()
      // compose A4 structured record from current journal state before opening preview
      const _a4 = composeA4Record({
        userId: selectedUser,
        date: new Date().toISOString(),
        // cast to any to work around legacy/loose runtime types from DataStorageService
        transport: (careEvents as any).filter((e: any) => e.eventType === "transport"),
        vitals: (careEvents as any).filter((e: any) => e.eventType === "vitals"),
        intake: (careEvents as any).filter((e: any) =>
          ["hydration", "intake", "tube_feeding", "meal_tube_feeding"].includes(e.eventType),
        ),
        excretion: (careEvents as any).filter((e: any) => e.eventType === "excretion"),
        medCare: (careEvents as any).filter(
          (e: any) => e.eventType === "medication" || e.eventType === "med-care" || e.eventType === "medCare",
        ),
        activities: (careEvents as any).filter((e: any) => e.eventType === "activity" || e.eventType === "activities"),
        observation: ((dailyLog as any) && ((dailyLog as any).observation || (dailyLog as any).observations)) || undefined,
        rom: (careEvents as any).filter((e: any) => e.eventType === "rom"),
        incidents: (careEvents as any).filter((e: any) => e.eventType === "incident" || e.eventType === "incidents"),
        notes: (dailyLog && (dailyLog.notes || dailyLog.specialNotes || undefined)) || undefined,
        serviceType: undefined,
        staffIds: undefined,
      })

      setIsA4RecordSheetOpen(true)
      console.log("[v0] Opening A4 record sheet preview")
      toast({
        variant: "default",
        title: "A4記録用紙を開きました",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "A4記録用紙の生成に失敗しました",
        description: "もう一度お試しください",
      })
    } finally {
      setIsLoading(false)
    }
  }, [generateDailyLog, toast, careEvents, dailyLog, selectedUser])

  const handleA4RecordSheetPrint = useCallback(() => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const recordSheetElement = document.getElementById("a4-record-sheet")
      if (recordSheetElement) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>介護記録用紙 - ${selectedUser}</title>
              <style>
                @media print {
                  @page { margin: 0; size: A4; }
                  body { margin: 0; font-family: sans-serif; }
                }
                ${document.head.querySelector("style")?.innerHTML || ""}
              </style>
            </head>
            <body>
              ${recordSheetElement.outerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }, [selectedUser])

  const handleDataChange = useCallback(() => {
    generateDailyLog()
    const savedUserNames = DataStorageService.getCustomUserNames()
    if (savedUserNames.length > 0) {
      setCustomUserNames(savedUserNames)
      // Update selected user if current selection doesn't exist in restored names
      if (!savedUserNames.includes(selectedUser)) {
        setSelectedUser(savedUserNames[0])
      }
    }
    toast({
      variant: "default",
      title: "データが更新されました",
    })
  }, [generateDailyLog, selectedUser, toast])

  const handleUserNamesUpdate = (newUserNames: string[]) => {
    setCustomUserNames(newUserNames)
    // Update selected user if current selection doesn't exist in new names
    if (!newUserNames.includes(selectedUser)) {
      setSelectedUser(newUserNames[0] || "利用者A")
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "1":
            event.preventDefault()
            setCurrentView("dashboard")
            break
          case "2":
            event.preventDefault()
            setCurrentView("statistics")
            break
          case "3":
            event.preventDefault()
            setCurrentView("settings")
            break
          case "p":
            event.preventDefault()
            handlePdfPreview()
            break
          case "e":
            event.preventDefault()
            handleExcelExport()
            break
          case "a":
            event.preventDefault()
            handleA4RecordSheetPreview()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handlePdfPreview, handleExcelExport, handleA4RecordSheetPreview])

  const currentUsers = customUserNames.length > 0 ? customUserNames : users

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('app.title', '重心ケアアプリ')} - PROJECT SOUL</h1>
              <p className="text-muted-foreground font-medium">重症心身障がい児者の包括的福祉支援システム</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <label htmlFor="serviceType" className="sr-only">サービス種別</label>
              <select
                id="serviceType"
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
                value={serviceType}
                onChange={handleServiceChange}
              >
                <option value="">サービス種別を選択</option>
                {welfareServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>

              <label htmlFor="userSelect" className="sr-only">対象利用者</label>
              <select
                id="userSelect"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm hover:shadow-md min-w-[120px]"
                aria-label="利用者を選択"
              >
                {currentUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                {displayDate}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick access to Expression & Seizure Logs */}
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl text-2xl">😊</div>
                <div>
                  <h3 className="font-semibold text-amber-900">表情・反応記録</h3>
                  <p className="text-sm text-amber-700">発作記録と同一UXで素早く入力</p>
                </div>
              </div>
              <Button
                onClick={() => _router.push("/daily-log/expression")}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                記録を入力
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 rounded-xl text-2xl">⚡</div>
                <div>
                  <h3 className="font-semibold text-rose-900">発作記録（新UI）</h3>
                  <p className="text-sm text-rose-700">表情・反応と同一UXで素早く入力</p>
                </div>
              </div>
              <Button
                onClick={() => _router.push("/daily-log/seizure")}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                記録を入力
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {welfareServices.map((service) => (
            <ClickableCard
              key={service.id}
              onClick={() => _router.push(`/services/${service.id}`)}
              className={`group border-2 hover:border-primary/30 ${service.color}`}
              particleColors={["#FFB6C1", "#FFD700", "#DDA0DD"]}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/50 text-2xl transition-all duration-300 group-hover:scale-110">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">{service.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="flex flex-wrap gap-1">
                  {service.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </ClickableCard>
          ))}
        </div>

        {/* 🧪 試験機能 / AI支援セクション */}
        <section aria-labelledby="ai-lab-section" className="space-y-4">
          <h2 id="ai-lab-section" className="text-xl font-bold text-foreground">🧪 試験機能 / AI支援セクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClickableCard
              onClick={() => _router.push('/todos')}
              className="group border-2 hover:border-primary/30 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-primary"
              particleColors={["#34d399", "#10b981", "#6ee7b7"]}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/60 text-2xl">📝</div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">ToDoリスト</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-700">チームのタスク管理と共有。優先度・期限・完了をシンプルに管理。</p>
              </CardContent>
            </ClickableCard>

            <ClickableCard
              onClick={() => _router.push('/diary/monthly')}
              className="group border-2 hover:border-primary/30 bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-primary"
              particleColors={["#38bdf8", "#0ea5e9", "#7dd3fc"]}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/60 text-2xl">📄</div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">月次AI要約PDF</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-sky-700">AI要約を含む月次PDFを生成・ダウンロード。対象月やIDはページ内で指定。</p>
              </CardContent>
            </ClickableCard>
          </div>
        </section>

        {currentView === "dashboard" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">📄</div>
                    記録の出力
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleA4RecordSheetPreview}
                      className="flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg w-full"
                      disabled={isLoading}
                      title="A4記録用紙プレビュー (Ctrl+A)"
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : "📋"}
                      A4記録用紙
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handlePdfPreview}
                        className="flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg flex-1"
                        disabled={isLoading}
                        title="PDFプレビュー (Ctrl+P)"
                      >
                        {isLoading ? <LoadingSpinner size="sm" /> : "👁️"}
                        PDFプレビュー
                      </Button>
                      <div className="flex items-center gap-3 flex-1">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={includeAlerts}
                            onChange={(e) => setIncludeAlerts(e.target.checked)}
                          />
                          アラート列を含める
                        </label>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleExcelExport}
                        className="flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg flex-1 bg-transparent"
                        disabled={isExporting}
                        title="CSV出力 (Ctrl+E)"
                      >
                        {isExporting ? <LoadingSpinner size="sm" /> : "📥"}
                        CSV出力
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <DataBackupPanel onDataChange={handleDataChange} />
            </div>

            {dailyLog && (
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-secondary/10 rounded-lg">📊</div>
                    本日の記録サマリー - {String((dailyLog as any)?.user ?? "")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {((dailyLog as any).events || []).map(
                      (event: { type: string; count: number; name: string; lastRecorded: string }) => (
                        <div
                          key={event.type}
                          className="text-center p-4 bg-gradient-to-br from-muted/50 to-muted rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105"
                        >
                          <div className="text-3xl font-bold text-primary mb-1">{event.count}</div>
                          <div className="text-sm font-medium text-foreground mb-1">{event.name}</div>
                          <div className="text-xs text-muted-foreground">最終: {event.lastRecorded}</div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : currentView === "statistics" ? (
          <StatisticsDashboard selectedUser={selectedUser} />
        ) : (
          <div className="space-y-6">
            <AdminPasswordAuth onUserNamesUpdate={handleUserNamesUpdate} onAppTitleUpdate={() => {}} />
            <SettingsPanel selectedUser={selectedUser} onUserChange={setSelectedUser} />
          </div>
        )}

        {/* Remove unused CareFormModal */}
        {/* <CareFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formType={currentFormType}
          onSubmit={handleFormSubmit}
          selectedUser={selectedUser}
        /> */}

        <PdfPreviewModal
          isOpen={isPdfPreviewOpen}
          onClose={() => setIsPdfPreviewOpen(false)}
          dailyLog={dailyLog}
          careEvents={careEvents}
        />

        {isA4RecordSheetOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">A4記録用紙 - {selectedUser}</h2>
                <div className="flex gap-2">
                  <Button onClick={handleA4RecordSheetPrint} className="flex items-center gap-2" size="sm">
                    🖨️ 印刷
                  </Button>
                  <Button onClick={() => setIsA4RecordSheetOpen(false)} variant="outline" size="sm">
                    閉じる
                  </Button>
                </div>
              </div>
              <div className="overflow-auto max-h-[calc(90vh-80px)]">
                <div id="a4-record-sheet">
                  {(() => {
                    // Build A4 record using composeA4Record from current journal state
                    const a4 = composeA4Record({
                      // cast to any to work around legacy/loose runtime types from DataStorageService
                      userId: selectedUser,
                      date: new Date().toISOString(),
                      transport: (careEvents as any).filter((e: any) => e.eventType === "transport"),
                      vitals: (careEvents as any).filter((e: any) => e.eventType === "vitals"),
                      intake: (careEvents as any).filter((e: any) =>
                        ["hydration", "intake", "tube_feeding", "meal_tube_feeding"].includes(e.eventType),
                      ),
                      excretion: (careEvents as any).filter((e: any) => e.eventType === "excretion"),
                      medCare: (careEvents as any).filter(
                        (e: any) => e.eventType === "medication" || e.eventType === "med-care" || e.eventType === "medCare",
                      ),
                      activities: (careEvents as any).filter((e: any) => e.eventType === "activity" || e.eventType === "activities"),
                      observation: ((dailyLog as any) && ((dailyLog as any).observation || (dailyLog as any).observations)) || undefined,
                      rom: (careEvents as any).filter((e: any) => e.eventType === "rom"),
                      incidents: (careEvents as any).filter((e: any) => e.eventType === "incident" || e.eventType === "incidents"),
                      notes: ((dailyLog as any) && ((dailyLog as any).notes || (dailyLog as any).specialNotes || undefined)) || undefined,
                      serviceType: undefined,
                      staffIds: undefined,
                    })

                    return (
                      <A4RecordSheet
                        selectedUser={selectedUser}
                        dailyRecords={careEvents}
                        date={a4RecordDate}
                        record={a4}
                      />
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ci-touch: trigger required CI for PR#98 (no-op)
