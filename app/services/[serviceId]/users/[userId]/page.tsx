"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import ClickableCard from "@/components/clickable-card"
import { formUrl } from "@/lib/url"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataStorageService } from "@/services/data-storage-service"

const welfareServices: { [key: string]: { name: string; icon: string; color: string } } = {
  "life-care": { name: "生活介護", icon: "🏥", color: "bg-blue-50" },
  "after-school": { name: "放課後等デイサービス", icon: "🎓", color: "bg-green-50" },
  "day-support": { name: "日中一時支援", icon: "⏰", color: "bg-orange-50" },
  "group-home": { name: "グループホーム", icon: "🏠", color: "bg-purple-50" },
  "home-care": { name: "重度訪問介護", icon: "🚑", color: "bg-red-50" },
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
]

type UserDetail = {
  age: number
  gender: string
  careLevel: string
  condition: string
  medicalCare: string
  service: string[]
  name: string
}

const userDetails: Record<string, UserDetail> = {
  "A・T": {
    name: "A・T",
    age: 36,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、遠視性弱視、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "I・K": {
    name: "I・K",
    age: 47,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、側湾症、体幹四肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "O・S": {
    name: "O・S",
    age: 42,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "S・M": {
    name: "S・M",
    age: 38,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "N・M": {
    name: "N・M",
    age: 45,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "W・M": {
    name: "W・M",
    age: 51,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "S・Y": {
    name: "S・Y",
    age: 39,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "Y・K": {
    name: "Y・K",
    age: 44,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "I・K2": {
    name: "I・K",
    age: 35,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "O・M": {
    name: "O・M",
    age: 48,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "U・S": {
    name: "U・S",
    age: 41,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "I・T": {
    name: "I・T",
    age: 37,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string
  const userId = decodeURIComponent(params.userId as string)
  const service = welfareServices[serviceId]

  const [currentView, setCurrentView] = useState<"overview" | "case-records" | "daily-logs">("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedUser, setEditedUser] = useState<UserDetail>(() => {
    const details = userDetails[userId]
    if (details) {
      return { ...details }
    }

    return {
      age: 0,
      gender: "不明",
      careLevel: "不明",
      condition: "情報なし",
      medicalCare: "情報なし",
      service: [serviceId],
      name: userId,
    }
  })
  const [displayName, setDisplayName] = useState(() => userDetails[userId]?.name ?? userId)
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    const profile = DataStorageService.getUserProfile(userId)
    if (profile?.name) {
      setDisplayName(profile.name)
    }
  }, [userId])

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    )
  }, [])

  const storedUserDetails = userDetails[userId]
  const currentUserDetails: UserDetail = storedUserDetails
    ? { ...storedUserDetails, name: displayName }
    : {
        age: 0,
        gender: "不明",
        careLevel: "不明",
        condition: "情報なし",
        medicalCare: "情報なし",
        service: [serviceId],
        name: displayName,
      }

  const handleSaveUser = () => {
    const oldName = displayName
    const newName = editedUser.name.trim() || userId

    if (newName !== oldName) {
      try {
        DataStorageService.updateUserNameInProfiles(oldName, newName)
        DataStorageService.updateUserNameInEvents(oldName, newName)

        const customNames = DataStorageService.getCustomUserNames()
        const updatedNames = new Set(customNames)
        if (updatedNames.has(oldName)) {
          updatedNames.delete(oldName)
        }
        updatedNames.add(newName)
        DataStorageService.saveCustomUserNames(Array.from(updatedNames))

        alert(`氏名を「${oldName}」から「${newName}」に変更しました。`)
      } catch (error) {
        console.error("Failed to update user name:", error)
        alert("氏名の変更に失敗しました。もう一度お試しください。")
        return
      }
    }

    userDetails[userId] = { ...editedUser, name: newName }
    setDisplayName(newName)
    setIsEditDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push(`/services/${serviceId}`)}>
                ← 利用者一覧に戻る
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {currentUserDetails.gender === "男性" || currentUserDetails.gender === "男児"
                    ? "👨"
                    : currentUserDetails.gender === "女性" || currentUserDetails.gender === "女児"
                      ? "👩"
                      : "👤"}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  <p className="text-sm text-muted-foreground">{service.name}</p>
                </div>
              </div>
            </div>
            {currentDate && (
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                {currentDate}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {currentView === "overview" && (
          <>
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">👤</div>
                  利用者情報
                </CardTitle>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditedUser({ ...currentUserDetails, name: displayName })}
                    >
                      ✏️ 編集
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
                    <DialogHeader>
                      <DialogTitle>利用者情報を編集</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          氏名
                        </Label>
                        <Input
                          id="name"
                          className="bg-white border-gray-300"
                          value={editedUser.name}
                          onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                          placeholder="氏名を入力してください"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          年齢
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          className="bg-white border-gray-300"
                          value={editedUser.age || ""}
                          onChange={(e) => setEditedUser({ ...editedUser, age: Number.parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                          性別
                        </Label>
                        <Select
                          value={editedUser.gender}
                          onValueChange={(value) => setEditedUser({ ...editedUser, gender: value })}
                        >
                          <SelectTrigger className="bg-white border-gray-300">
                            <SelectValue placeholder="性別を選択" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                            <SelectItem value="男性" className="hover:bg-blue-50 cursor-pointer py-3 text-base">
                              男性
                            </SelectItem>
                            <SelectItem value="女性" className="hover:bg-pink-50 cursor-pointer py-3 text-base">
                              女性
                            </SelectItem>
                            <SelectItem value="男児" className="hover:bg-blue-50 cursor-pointer py-3 text-base">
                              男児
                            </SelectItem>
                            <SelectItem value="女児" className="hover:bg-pink-50 cursor-pointer py-3 text-base">
                              女児
                            </SelectItem>
                            <SelectItem value="不明" className="hover:bg-gray-50 cursor-pointer py-3 text-base">
                              不明
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="careLevel" className="text-sm font-medium text-gray-700">
                          介護度
                        </Label>
                        <Select
                          value={editedUser.careLevel}
                          onValueChange={(value) => setEditedUser({ ...editedUser, careLevel: value })}
                        >
                          <SelectTrigger className="bg-white border-gray-300">
                            <SelectValue placeholder="介護度を選択" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                            <SelectItem value="全介助" className="hover:bg-red-50 cursor-pointer py-3 text-base">
                              全介助
                            </SelectItem>
                            <SelectItem value="一部介助" className="hover:bg-yellow-50 cursor-pointer py-3 text-base">
                              一部介助
                            </SelectItem>
                            <SelectItem value="見守り" className="hover:bg-green-50 cursor-pointer py-3 text-base">
                              見守り
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="condition" className="text-sm font-medium text-gray-700">
                          基礎疾患
                        </Label>
                        <Textarea
                          id="condition"
                          className="bg-white border-gray-300"
                          value={editedUser.condition || ""}
                          onChange={(e) => setEditedUser({ ...editedUser, condition: e.target.value })}
                          rows={4}
                          placeholder="基礎疾患を入力してください"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medicalCare" className="text-sm font-medium text-gray-700">
                          医療ケア
                        </Label>
                        <Textarea
                          id="medicalCare"
                          className="bg-white border-gray-300"
                          value={editedUser.medicalCare || ""}
                          onChange={(e) => setEditedUser({ ...editedUser, medicalCare: e.target.value })}
                          rows={3}
                          placeholder="医療ケア内容を入力してください（なしの場合は「なし」と入力）"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleSaveUser}>保存</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">氏名</p>
                    <p className="text-lg font-semibold">{displayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">ステータス</p>
                    <p className="text-lg font-semibold">まってぃー</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">サービス</p>
                    <p className="text-lg font-semibold">{service.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">年齢</p>
                    <p className="text-lg font-semibold">{currentUserDetails.age}歳</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">性別</p>
                    <p className="text-lg font-semibold">{currentUserDetails.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">介護度</p>
                    <p className="text-lg font-semibold">{currentUserDetails.careLevel}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">基礎疾患</p>
                    <p className="text-base leading-relaxed">{currentUserDetails.condition}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">医療ケア</p>
                    <p className="text-base leading-relaxed">{currentUserDetails.medicalCare}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/30"
                onClick={() => setCurrentView("case-records")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg group-hover:text-primary transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg text-2xl">📋</div>
                    ケース記録を見る
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    利用者の総合的なケース記録、支援計画、過去の履歴を確認できます。
                  </p>
                </CardContent>
              </Card>

              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/30"
                onClick={() => setCurrentView("daily-logs")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg group-hover:text-primary transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg text-2xl">📝</div>
                    日誌記録
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    日々のケア記録（発作、バイタル、排泄など16種類）を記録・確認できます。
                  </p>
                </CardContent>
              </Card>
              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/30"
                onClick={() => {
                  const encodedUser = encodeURIComponent(userId)
                  router.push(`/services/${serviceId}/users/${encodedUser}/timeline`)
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg group-hover:text-primary transition-colors">
                    <div className="p-2 bg-purple-100 rounded-lg text-2xl">🕒</div>
                    タイムライン
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">この利用者の最近の発作イベントなどを時系列で確認します。</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentView === "case-records" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">ケース記録</h2>
              <Button variant="outline" onClick={() => setCurrentView("overview")}>
                ← 戻る
              </Button>
            </div>
            <Card className="shadow-lg">
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground">ケース記録機能は準備中です</p>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "daily-logs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">日誌記録 - {displayName}</h2>
              <Button variant="outline" onClick={() => setCurrentView("overview")}>
                ← 戻る
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyLogCategories.map((category) => (
                  <ClickableCard
                  key={category.id}
                  onClick={() => {
                    router.push(formUrl(category.id, serviceId, userId))
                  }}
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
          </div>
        )}
      </main>
    </div>
  )
}
