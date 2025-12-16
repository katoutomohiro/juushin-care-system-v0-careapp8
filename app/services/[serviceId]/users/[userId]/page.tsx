"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import ClickableCard from "@/components/clickable-card"
import CaseRecordCards from "./_components/case-records-cards"
import { formUrl } from "@/lib/url"
import { userDetails } from "@/lib/user-master-data"
import { DataStorageService } from "@/services/data-storage-service"
import type { ServiceType, UserDetail } from "@/lib/user-service-allocation"
import { SERVICE_TIME_CANDIDATES, TOTAL_SERVICE_TIME_OPTIONS } from "@/lib/case-record-constants"
import { AT_USER_ID, ATCaseRecord } from "@/lib/at-case-record-template"
import { ATCaseRecordForm } from "@/components/at-case-record-form"
import { ATCaseRecordPrint } from "@/components/at-case-record-print"

const welfareServices: Record<ServiceType, { name: string; icon: string; color: string }> = {
  "life-care": { name: "生活介護", icon: "🏥", color: "bg-blue-50" },
  "after-school": { name: "放課後等デイサービス", icon: "🎓", color: "bg-green-50" },
  "day-support": { name: "日中一時支援", icon: "⏰", color: "bg-orange-50" },
  "group-home": { name: "グループホーム", icon: "🏠", color: "bg-purple-50" },
  "home-care": { name: "重度訪問介護", icon: "🚑", color: "bg-red-50" },
}

const dailyLogCategories = [
  { id: "seizure", name: "発作記録", icon: "⚡", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100", iconBg: "bg-red-100 text-red-600", description: "発作の種類・時間・対応を記録" },
  { id: "expression", name: "表情・反応", icon: "😊", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100", iconBg: "bg-amber-100 text-amber-600", description: "表情・反応や声かけへの様子を記録" },
  { id: "vitals", name: "バイタル", icon: "🌡️", color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100", iconBg: "bg-rose-100 text-rose-600", description: "体温・脈拍・血圧などのバイタルを記録" },
  { id: "respiratory", name: "呼吸状態", icon: "💨", color: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100", iconBg: "bg-cyan-100 text-cyan-600", description: "呼吸状態や酸素投与の状況を記録" },
  { id: "hydration", name: "水分補給", icon: "💧", color: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100", iconBg: "bg-sky-100 text-sky-600", description: "水分量・方法・姿勢などを記録" },
  { id: "swallowing", name: "嚥下・食事", icon: "🍚", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100", iconBg: "bg-orange-100 text-orange-600", description: "嚥下や食事時の様子・姿勢を記録" },
  { id: "tubeFeeding", name: "経管栄養", icon: "🧴", color: "bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100", iconBg: "bg-lime-100 text-lime-600", description: "経管栄養の内容・量・様子を記録" },
  { id: "mealTubeFeeding", name: "経管食事", icon: "🥣", color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100", iconBg: "bg-teal-100 text-teal-600", description: "経管での食事メニューや介助の様子" },
  { id: "excretion", name: "排泄", icon: "🚾", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", iconBg: "bg-emerald-100 text-emerald-600", description: "排尿・排便の回数や性状を記録" },
  { id: "positioning", name: "体位交換・ポジショニング", icon: "🛏️", color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100", iconBg: "bg-indigo-100 text-indigo-600", description: "体位交換やポジショニングの実施内容" },
  { id: "skinOralCare", name: "スキン・口腔ケア", icon: "🧼", color: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100", iconBg: "bg-pink-100 text-pink-600", description: "スキンケアや口腔ケアの実施記録" },
  { id: "infectionPrevention", name: "感染予防", icon: "🛡️", color: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100", iconBg: "bg-slate-100 text-slate-600", description: "感染予防処置の内容を記録" },
  { id: "activity", name: "活動・余暇", icon: "🎨", color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100", iconBg: "bg-violet-100 text-violet-600", description: "活動内容・参加状況を記録" },
  { id: "communication", name: "コミュニケーション", icon: "💬", color: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100", iconBg: "bg-yellow-100 text-yellow-600", description: "意思疎通の様子や声掛けへの反応" },
  { id: "transportation", name: "送迎・移動", icon: "🚌", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100", iconBg: "bg-amber-100 text-amber-600", description: "送迎や移動時の記録" },
]

type StaffOption = { id: string; name: string }

type ServiceUserDefaultsState = {
  defaultMainStaffId: string | null
  defaultSubStaffIds: string[] | null
  defaultServiceStartTime: string | null
  defaultServiceEndTime: string | null
  defaultTotalServiceMinutes: string | null
  defaultDayServiceAmStartTime: string | null
  defaultDayServiceAmEndTime: string | null
  defaultDayServicePmStartTime: string | null
  defaultDayServicePmEndTime: string | null
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()

  const serviceId = params.serviceId as ServiceType
  const userId = decodeURIComponent(params.userId as string)
  const service = welfareServices[serviceId]

  // ユーザーマスタ: 静的 userDetails をベースに、supabase public.service_users のデフォルト値は API 経由で読み込み
  const storedDetail = userDetails[userId]
  const fallbackUser: UserDetail = {
    name: userId,
    age: 0,
    gender: "不明",
    careLevel: "不明",
    condition: "特記事項なし",
    medicalCare: "特記事項なし",
    service: [serviceId],
  }

  const [currentView, setCurrentView] = useState<"overview" | "daily-logs" | "at-case-record-form" | "at-case-record-preview">("overview")
  const [atCaseRecordData, setATCaseRecordData] = useState<ATCaseRecord | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedUser, setEditedUser] = useState<UserDetail>(storedDetail ? { ...storedDetail } : { ...fallbackUser })
  const [displayName, setDisplayName] = useState(() => storedDetail?.name ?? userId)
  const [currentDate, setCurrentDate] = useState<string>("")
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([])
  const [serviceUserDefaults, setServiceUserDefaults] = useState<ServiceUserDefaultsState>({
    defaultMainStaffId: null,
    defaultSubStaffIds: null,
    defaultServiceStartTime: null,
    defaultServiceEndTime: null,
    defaultTotalServiceMinutes: null,
    defaultDayServiceAmStartTime: null,
    defaultDayServiceAmEndTime: null,
    defaultDayServicePmStartTime: null,
    defaultDayServicePmEndTime: null,
  })

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

  useEffect(() => {
    fetch("/api/staff/active?limit=10")
      .then((res) => res.json())
      .then((json) => {
        const payload = json?.staff ?? json?.data
        if (json?.ok && Array.isArray(payload)) {
          setStaffOptions(payload)
        }
      })
      .catch((e) => console.error("[UserDetailPage] staff load failed", e))
  }, [])

  useEffect(() => {
    fetch(`/api/service-users/${encodeURIComponent(userId)}/defaults`)
      .then((res) => res.json())
      .then((json) => {
        const defaults = json?.defaults || json?.data
        if (json?.ok && defaults) {
          setServiceUserDefaults((prev) => ({
            ...prev,
            ...extractDefaults(defaults),
          }))
        }
      })
      .catch((e) => console.error("[UserDetailPage] service user defaults load failed", e))
  }, [userId])

  const currentUserDetails: UserDetail = useMemo(
    () => (storedDetail ? { ...storedDetail, name: displayName } : { ...editedUser, name: displayName }),
    [storedDetail, editedUser, displayName],
  )

  const resolveStaffName = (id: string | null | undefined) => {
    if (!id) return "-"
    return staffOptions.find((s) => s.id === id)?.name || id
  }

  const extractDefaults = (data: any): ServiceUserDefaultsState => {
    const subStaffIds =
      data?.defaultSubStaffIds ??
      data?.default_sub_staff_ids ??
      (data?.defaultSubStaffId ? [data.defaultSubStaffId] : null) ??
      (data?.default_sub_staff_id ? [data.default_sub_staff_id] : null)
    return {
      defaultMainStaffId: data?.defaultMainStaffId ?? null,
      defaultSubStaffIds: Array.isArray(subStaffIds) ? subStaffIds.filter(Boolean) : null,
      defaultServiceStartTime: data?.defaultServiceStartTime ?? null,
      defaultServiceEndTime: data?.defaultServiceEndTime ?? null,
      defaultTotalServiceMinutes:
        data?.defaultTotalServiceMinutes !== undefined && data?.defaultTotalServiceMinutes !== null
          ? String(data.defaultTotalServiceMinutes)
          : null,
      defaultDayServiceAmStartTime: data?.defaultDayServiceAmStartTime ?? null,
      defaultDayServiceAmEndTime: data?.defaultDayServiceAmEndTime ?? null,
      defaultDayServicePmStartTime: data?.defaultDayServicePmStartTime ?? null,
      defaultDayServicePmEndTime: data?.defaultDayServicePmEndTime ?? null,
    }
  }

  const handleSaveUser = async () => {
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

    setDisplayName(newName)
    const payloadDefaults = {
      ...serviceUserDefaults,
      defaultSubStaffIds:
        serviceUserDefaults.defaultSubStaffIds && serviceUserDefaults.defaultSubStaffIds.length > 0
          ? serviceUserDefaults.defaultSubStaffIds
          : null,
      defaultTotalServiceMinutes: serviceUserDefaults.defaultTotalServiceMinutes
        ? Number(serviceUserDefaults.defaultTotalServiceMinutes)
        : null,
    }
    try {
      const res = await fetch(`/api/service-users/${encodeURIComponent(userId)}/defaults`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          serviceType: serviceId,
          ...payloadDefaults,
        }),
      })
      const json = await res.json()
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.message || json?.error || "保存に失敗しました")
      }
      const defaults = json?.defaults || json?.data
      if (defaults) {
        setServiceUserDefaults((prev) => ({ ...prev, ...extractDefaults(defaults) }))
      }
      alert("デフォルト設定を保存しました")
    } catch (error) {
      console.error("[UserDetailPage] save defaults failed", error)
      alert("デフォルト設定の保存に失敗しました")
    }

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
                  {currentUserDetails.gender === "男性" ? "👨" : currentUserDetails.gender === "女性" ? "👩" : "👤"}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/services/${serviceId}/users/${encodeURIComponent(userId)}/case-records`)}
                    >
                      ケース記録を見る
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/services/${serviceId}/users/${encodeURIComponent(userId)}/case-records/excel`)}
                    >
                      ケース記録 (Excel手入力)
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{service?.name ?? serviceId}</p>
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
                    <Button variant="outline" size="sm" onClick={() => setEditedUser({ ...currentUserDetails })}>
                      ✏ 編集
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
                        <Select value={editedUser.gender} onValueChange={(value) => setEditedUser({ ...editedUser, gender: value })}>
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
                            <SelectItem value="不明" className="hover:bg-gray-50 cursor-pointer py-3 text-base">
                              不明
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
                          placeholder="医療ケア概要を入力してください（なしの場合は「なし」）"
                        />
                      </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">主担当（デフォルト）</Label>
                    <Select
                      value={serviceUserDefaults.defaultMainStaffId || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultMainStaffId: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {staffOptions.length ? (
                          staffOptions.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__no_staff__" disabled>
                            スタッフ未設定
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">従担当（デフォルト）</Label>
                    <Select
                      value={serviceUserDefaults.defaultSubStaffIds?.[0] || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultSubStaffIds: value ? [value] : null }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {staffOptions.length ? (
                          staffOptions.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__no_staff__" disabled>
                            スタッフ未設定
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">サービス開始時間（デフォルト）</Label>
                    <Select
                      value={serviceUserDefaults.defaultServiceStartTime || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultServiceStartTime: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {SERVICE_TIME_CANDIDATES.map((opt) => (
                          <SelectItem key={`start-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">サービス終了時間（デフォルト）</Label>
                    <Select
                      value={serviceUserDefaults.defaultServiceEndTime || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultServiceEndTime: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {SERVICE_TIME_CANDIDATES.map((opt) => (
                          <SelectItem key={`end-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">トータルサービス提供時間（デフォルト）</Label>
                    <Select
                      value={serviceUserDefaults.defaultTotalServiceMinutes || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultTotalServiceMinutes: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {TOTAL_SERVICE_TIME_OPTIONS.map((opt) => (
                          <SelectItem key={`total-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">日中一時（午前）開始</Label>
                    <Select
                      value={serviceUserDefaults.defaultDayServiceAmStartTime || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultDayServiceAmStartTime: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {SERVICE_TIME_CANDIDATES.map((opt) => (
                          <SelectItem key={`morning-start-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">日中一時（午前）終了</Label>
                    <Select
                      value={serviceUserDefaults.defaultDayServiceAmEndTime || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultDayServiceAmEndTime: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {SERVICE_TIME_CANDIDATES.map((opt) => (
                          <SelectItem key={`morning-end-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">日中一時（午後）開始</Label>
                    <Select
                      value={serviceUserDefaults.defaultDayServicePmStartTime || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultDayServicePmStartTime: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {SERVICE_TIME_CANDIDATES.map((opt) => (
                          <SelectItem key={`afternoon-start-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">日中一時（午後）終了</Label>
                    <Select
                      value={serviceUserDefaults.defaultDayServicePmEndTime || ""}
                      onValueChange={(value) => setServiceUserDefaults((prev) => ({ ...prev, defaultDayServicePmEndTime: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="未設定" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                        {SERVICE_TIME_CANDIDATES.map((opt) => (
                          <SelectItem key={`afternoon-end-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <p className="text-sm text-muted-foreground mb-1">サービス</p>
                    <p className="text-lg font-semibold">{service?.name ?? serviceId}</p>
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
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">主担当（デフォルト）</p>
                      <p className="text-base font-semibold">{resolveStaffName(serviceUserDefaults.defaultMainStaffId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">従担当（デフォルト）</p>
                      <p className="text-base font-semibold">{resolveStaffName(serviceUserDefaults.defaultSubStaffIds?.[0])}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">サービス時間デフォルト</p>
                      <p className="text-base font-semibold">{serviceUserDefaults.defaultServiceStartTime || "-"} ～ {serviceUserDefaults.defaultServiceEndTime || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">トータル提供時間デフォルト</p>
                      <p className="text-base font-semibold">{serviceUserDefaults.defaultTotalServiceMinutes || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">日中一時（午前）デフォルト</p>
                      <p className="text-base font-semibold">{serviceUserDefaults.defaultDayServiceAmStartTime || "-"} ～ {serviceUserDefaults.defaultDayServiceAmEndTime || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">日中一時（午後）デフォルト</p>
                      <p className="text-base font-semibold">{serviceUserDefaults.defaultDayServicePmStartTime || "-"} ～ {serviceUserDefaults.defaultDayServicePmEndTime || "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CaseRecordCards userId={userId} serviceId={serviceId} staffOptions={staffOptions} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/30"
                onClick={() => {
                  const encodedUser = encodeURIComponent(userId)
                  router.push(`/services/${serviceId}/users/${encodedUser}/case-records`)
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg group-hover:text-primary transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg text-2xl">📋</div>
                    ケース記録を見る
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">ケース記録の入力・確認はこちら</p>
                </CardContent>
              </Card>

              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/30"
                onClick={() => {
                  if (userId === AT_USER_ID) {
                    setATCaseRecordData(null)
                    setCurrentView("at-case-record-form")
                  } else {
                    setCurrentView("daily-logs")
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg group-hover:text-primary transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg text-2xl">📝</div>
                    {userId === AT_USER_ID ? "ケース記録入力（A4印刷対応）" : "日誌記録"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {userId === AT_USER_ID ? "生活介護ケース記録の入力・確認" : "日誌（発作・バイタル・排泄など）入力・履歴"}
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
                  <p className="text-sm text-muted-foreground">最近の記録を時系列で確認</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentView === "daily-logs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">日誌記録 - {displayName}</h2>
              <div className="flex gap-2">
                <Button variant="secondary" asChild>
                  <Link
                    href={`/services/${serviceId}/users/${encodeURIComponent(userId)}/daily-logs`}
                    prefetch={false}
                  >
                    全ての日誌を見る
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("overview")}>
                  ← 戻る
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {currentView === "at-case-record-form" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">ケース記録入力 - {displayName}</h2>
              <Button variant="outline" onClick={() => setCurrentView("overview")}>
                ← 戻る
              </Button>
            </div>
            <ATCaseRecordForm
              date={currentDate}
              onSave={(data) => {
                setATCaseRecordData(data)
                setCurrentView("at-case-record-preview")
              }}
              onCancel={() => setCurrentView("overview")}
            />
          </div>
        )}

        {currentView === "at-case-record-preview" && atCaseRecordData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">ケース記録プレビュー - {displayName}</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.print()}
                  className="bg-primary hover:bg-primary/90"
                >
                  🖨️ 印刷する
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setCurrentView("at-case-record-form")}
                >
                  ← 編集に戻る
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("overview")}>
                  ← 閉じる
                </Button>
              </div>
            </div>
            <ATCaseRecordPrint record={atCaseRecordData} />
          </div>
        )}
      </main>
    </div>
  )
}
