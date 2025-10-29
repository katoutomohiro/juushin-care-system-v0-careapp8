"use client"

import { useParams, useRouter } from "next/navigation"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClickableCard } from "@/components/ui/clickable-card"
import { formUrl } from "@/lib/url"

const welfareServices: { [key: string]: { name: string; icon: string } } = {
  "life-care": { name: "生活介護", icon: "🏥" },
  "after-school": { name: "放課後等デイサービス", icon: "🎓" },
  "day-support": { name: "日中一時支援", icon: "⏰" },
  "group-home": { name: "グループホーム", icon: "🏠" },
  "home-care": { name: "重度訪問介護", icon: "🚑" },
}

const dailyLogCategories = [
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
  {
    id: "transportation",
    name: "送迎",
    icon: "🚌",
    color: "bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100",
    iconBg: "bg-lime-100 text-lime-600",
    description: "送迎ルート・時刻・状態を記録",
  },
  {
    id: "meal-tube-feeding",
    name: "食事・経管",
    icon: "🍱",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
    description: "食事内容・摂取量・むせの有無を記録",
  },
]

export default function DailyLogsPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string
  const userId = decodeURIComponent(params.userId as string)
  const service = welfareServices[serviceId]

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">サービスが見つかりません</p>
      </div>
    )
  }

  const handleCardClick = (categoryId: string) => {
    if (categoryId === "expression") {
      router.push(`/daily-log/expression?serviceId=${serviceId}&userId=${encodeURIComponent(userId)}`)
    } else if (categoryId === "seizure") {
      router.push(`/daily-log/seizure?serviceId=${serviceId}&userId=${encodeURIComponent(userId)}`)
    } else {
      router.push(formUrl(categoryId, serviceId, userId))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/services/${serviceId}/users/${encodeURIComponent(userId)}`)}
              >
                ← 利用者詳細に戻る
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">👤</div>
                <div>
                  <h1 className="text-2xl font-bold">{userId} - 日誌記録</h1>
                  <p className="text-sm text-muted-foreground">{service.name}</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
              {new Date().toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dailyLogCategories.map((category) => (
            <ClickableCard
              key={category.id}
              onClick={() => handleCardClick(category.id)}
              className={`group border-2 hover:border-primary/30 ${category.color} backdrop-blur-sm min-h-[200px] flex flex-col`}
              particleColors={["#FFE4E1", "#87CEEB", "#FFD700", "#DDA0DD"]}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${category.iconBg} text-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm flex-shrink-0`}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold leading-tight">{category.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{category.description}</p>
              </CardContent>
            </ClickableCard>
          ))}
        </div>
      </main>
    </div>
  )
}
