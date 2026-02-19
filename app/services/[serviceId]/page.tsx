"use client"

import { useParams, useRouter } from "next/navigation"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import ClickableCard from "@/components/clickable-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"

const welfareServices: { [key: string]: { name: string; icon: string; color: string } } = {
  "life-care": { name: "生活介護", icon: "🏥", color: "bg-blue-50" },
  "after-school": { name: "放課後等デイサービス", icon: "🎓", color: "bg-green-50" },
  "day-support": { name: "日中一時支援", icon: "⏰", color: "bg-orange-50" },
  "group-home": { name: "グループホーム", icon: "🏠", color: "bg-purple-50" },
  "home-care": { name: "重度訪問介護", icon: "🚑", color: "bg-red-50" },
}

const userDetails: {
  [key: string]: {
    age: number
    gender: string
    careLevel: string
    condition: string
    medicalCare: string
    service: string[]
  }
} = {
  "A・T": {
    age: 36,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、遠視性弱視、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "I・K": {
    age: 47,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、側湾症、体幹四肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "O・S": {
    age: 40,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、体幹四肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "S・M": {
    age: 43,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、脳炎後遺症、てんかん、精神遅滞、側湾症、両上下肢機能障害",
    medicalCare: "吸引、腸瘻",
    service: ["life-care"],
  },
  "N・M": {
    age: 32,
    gender: "男性",
    careLevel: "全介助",
    condition: "痙性四肢麻痺、重度知的障害、てんかん",
    medicalCare: "胃ろう注入、エアウェイ装着、カフアシスト使用、吸引、吸入",
    service: ["life-care"],
  },
  "W・M": {
    age: 32,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害、上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "S・Y": {
    age: 41,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害",
    medicalCare: "鼻腔栄養注入",
    service: ["life-care"],
  },
  "Y・K": {
    age: 22,
    gender: "男性",
    careLevel: "全介助",
    condition:
      "二分脊椎症、水頭症、急性脳症後遺症、膀胱機能障害、両上下肢機能障害、体幹機能障害、自閉症スペクトラム障害",
    medicalCare: "鼻腔チューブ使用、導尿",
    service: ["life-care"],
  },
  "I・K2": {
    age: 40,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、体幹四肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "O・M": {
    age: 23,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、視覚障害（全盲）、難聴、網膜症、脳原生移動障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "U・S": {
    age: 19,
    gender: "男性",
    careLevel: "全介助",
    condition: "クリッペファイル症候群、高度難聴、気管狭窄症、両下肢機能障害",
    medicalCare: "気管切開、気管内吸引、吸入、浣腸",
    service: ["life-care"],
  },
  "I・T": {
    age: 24,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺",
    medicalCare: "胃ろう注入",
    service: ["life-care"],
  },
  "M・S": {
    age: 18,
    gender: "男性",
    careLevel: "全介助",
    condition: "水頭症、脳原生上肢機能障害、脳原生上肢移動障害、側湾症",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "M・O": {
    age: 18,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害",
    medicalCare: "胃ろう注入、吸引、IVH埋め込み",
    service: ["life-care"],
  },
  "M・I": {
    age: 17,
    gender: "男児",
    careLevel: "全介助",
    condition: "慢性肺疾患、先天性性疾患、染色体異常、脳の形成不全、抗てんかん",
    medicalCare: "鼻腔注入",
    service: ["life-care"],
  },
  "T・Y": {
    age: 17,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "K・M": {
    age: 16,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "S・H": {
    age: 16,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "R・N": {
    age: 15,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "Y・T": {
    age: 14,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "H・K": {
    age: 13,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "N・S": {
    age: 12,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  "TEST_USER_01": {
    age: 99,
    gender: "テスト",
    careLevel: "テスト",
    condition: "テンプレート横展開検証用ダミーユーザー",
    medicalCare: "なし",
    service: ["life-care"],
  },
}

type CareReceiver = {
  id: string
  code: string
  name: string
  age?: number
  gender?: string
  careLevel?: string
  condition?: string
  medicalCare?: string
}

export default function ServiceUsersPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string
  const service = welfareServices[serviceId]

  const [users, setUsers] = useState<CareReceiver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    age: 0,
    gender: "不明",
    careLevel: "全介助",
    condition: "",
    medicalCare: "",
  })

  const fetchUsers = async () => {
    // Guard: trim and check serviceId once
    if (typeof serviceId !== 'string' || !serviceId.trim()) {
      console.warn('[ServiceUsersPage] serviceId not available or empty:', serviceId)
      setUsers([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const url = `/api/care-receivers?serviceId=${encodeURIComponent(serviceId)}`
      console.log('[ServiceUsersPage] Fetching care receivers from:', url)
      const response = await fetch(url, { cache: 'no-store' })

      // If HTTP error, log details but show generic UI message
      if (!response.ok) {
        const bodyText = await response.text()
        console.error('[ServiceUsersPage] HTTP error', {
          status: response.status,
          statusText: response.statusText,
          url,
          responseBody: bodyText,
        })
        setUsers([])
        setIsLoading(false)
        return
      }

      // Parse JSON only if response.ok
      const data = await response.json()

      if (data.ok) {
        const count = data.careReceivers?.length || 0
        console.log('[ServiceUsersPage] Successfully fetched', count, 'care receivers')
        setUsers(data.careReceivers || [])
      } else {
        console.warn('[ServiceUsersPage] API returned ok:false:', { error: data.error })
        setUsers([])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('[ServiceUsersPage] Exception during fetch', {
        message: errorMsg,
        error: error instanceof Error ? error.stack : String(error),
      })
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [serviceId])

  // Refresh when window gains focus (user navigates back from detail page)
  useEffect(() => {
    const handleFocus = () => {
      fetchUsers()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleAddUser = () => {
    if (!newUser.name.trim()) {
      alert("氏名を入力してください")
      return
    }

    // TODO: Implement API call to create new care receiver
    alert("新規追加機能は準備中です")
    setIsAddDialogOpen(false)
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">サービスが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                ← ダッシュボードに戻る
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{service.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold">{service.name}</h1>
                  <p className="text-sm text-muted-foreground">利用者一覧</p>
                </div>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>➕ 新規利用者追加</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>新規利用者を追加</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">氏名 *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="例: A・T"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-age">年齢</Label>
                    <Input
                      id="new-age"
                      type="number"
                      value={newUser.age || ""}
                      onChange={(e) => setNewUser({ ...newUser, age: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-gender">性別</Label>
                    <Select value={newUser.gender} onValueChange={(value) => setNewUser({ ...newUser, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="性別を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="男性">男性</SelectItem>
                        <SelectItem value="女性">女性</SelectItem>
                        <SelectItem value="男児">男児</SelectItem>
                        <SelectItem value="女児">女児</SelectItem>
                        <SelectItem value="不明">不明</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-careLevel">介護度</Label>
                    <Select
                      value={newUser.careLevel}
                      onValueChange={(value) => setNewUser({ ...newUser, careLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="介護度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全介助">全介助</SelectItem>
                        <SelectItem value="一部介助">一部介助</SelectItem>
                        <SelectItem value="見守り">見守り</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-condition">基礎疾患</Label>
                    <Textarea
                      id="new-condition"
                      value={newUser.condition}
                      onChange={(e) => setNewUser({ ...newUser, condition: e.target.value })}
                      rows={4}
                      placeholder="基礎疾患を入力してください"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-medicalCare">医療ケア</Label>
                    <Textarea
                      id="new-medicalCare"
                      value={newUser.medicalCare}
                      onChange={(e) => setNewUser({ ...newUser, medicalCare: e.target.value })}
                      rows={3}
                      placeholder="医療ケア内容を入力してください（なしの場合は「なし」と入力）"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleAddUser}>追加</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user) => {
              const details = userDetails[user.code] || {}
              const displayName = user.name || user.code

              return (
                <ClickableCard
                  key={user.id}
                  onClick={() => {
                    const internalId = normalizeUserId(user.code)
                    router.push(`/services/${serviceId}/users/${encodeURIComponent(internalId)}`)
                  }}
                  className={`group border-2 hover:border-primary/30 ${service.color}`}
                  particleColors={["#FFB6C1", "#FFD700", "#DDA0DD"]}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {details.gender === "男性" || details.gender === "男児"
                          ? "👨"
                          : details.gender === "女性" || details.gender === "女児"
                            ? "👩"
                            : "👤"}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">{displayName}</CardTitle>
                        <p className="text-sm text-muted-foreground">まってぃー</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">サービス:</span>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">年齢:</span>
                        <span className="font-medium">{details.age || '-'}歳</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">性別:</span>
                        <span className="font-medium">{details.gender || '不明'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">介護度:</span>
                        <span className="font-medium">{details.careLevel || '不明'}</span>
                      </div>
                    </div>
                  </CardContent>
                </ClickableCard>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
