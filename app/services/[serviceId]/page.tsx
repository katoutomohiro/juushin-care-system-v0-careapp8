"use client"

import { useParams, useRouter } from "next/navigation"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import ClickableCard from "@/components/clickable-card" // Fixed import path for ClickableCard
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  A・T: {
    age: 36,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、遠視性弱視、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  I・K: {
    age: 47,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、側湾症、体幹四肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  O・S: {
    age: 40,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、体幹四肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  S・M: {
    age: 43,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、脳炎後遺症、てんかん、精神遅滞、側湾症、両上下肢機能障害",
    medicalCare: "吸引、腸瘻",
    service: ["life-care"],
  },
  N・M: {
    age: 32,
    gender: "男性",
    careLevel: "全介助",
    condition: "痙性四肢麻痺、重度知的障害、てんかん",
    medicalCare: "胃ろう注入、エアウェイ装着、カフアシスト使用、吸引、吸入",
    service: ["life-care"],
  },
  W・M: {
    age: 32,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害、上下肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  S・Y: {
    age: 41,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害",
    medicalCare: "鼻腔栄養注入",
    service: ["life-care"],
  },
  Y・K: {
    age: 22,
    gender: "男性",
    careLevel: "全介助",
    condition:
      "二分脊椎症、水頭症、急性脳症後遺症、膀胱機能障害、両上下肢機能障害、体幹機能障害、自閉症スペクトラム障害",
    medicalCare: "鼻腔チューブ使用、導尿",
    service: ["life-care"],
  },
  I・K2: {
    age: 40,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、体幹四肢機能障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  O・M: {
    age: 23,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、視覚障害（全盲）、難聴、網膜症、脳原生移動障害",
    medicalCare: "なし",
    service: ["life-care"],
  },
  U・S: {
    age: 19,
    gender: "男性",
    careLevel: "全介助",
    condition: "クリッペファイル症候群、高度難聴、気管狭窄症、両下肢機能障害",
    medicalCare: "気管切開、気管内吸引、吸入、浣腸",
    service: ["life-care"],
  },
  I・T: {
    age: 24,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺",
    medicalCare: "胃ろう注入",
    service: ["life-care"],
  },
  M・S: {
    age: 18,
    gender: "男性",
    careLevel: "全介助",
    condition: "水頭症、脳原生上肢機能障害、脳原生上肢移動障害、側湾症",
    medicalCare: "なし",
    service: ["life-care"],
  },
  M・O: {
    age: 18,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害",
    medicalCare: "胃ろう注入、吸引、IVH埋め込み",
    service: ["life-care"],
  },
  M・I: {
    age: 17,
    gender: "男児",
    careLevel: "全介助",
    condition: "慢性肺疾患、先天性性疾患、染色体異常、脳の形成不全、抗てんかん",
    medicalCare: "鼻腔注入",
    service: ["after-school"],
  },
  S・K: {
    age: 15,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳腫瘍適切後遺症、脳原生上肢機能障害、脳原始移動機能障害、アレルギー性鼻炎、食物アレルギー",
    medicalCare: "シャント内臓",
    service: ["after-school"],
  },
  M・M: {
    age: 15,
    gender: "女児",
    careLevel: "一部介助",
    condition: "知的障がい",
    medicalCare: "なし",
    service: ["after-school"],
  },
  K・S: {
    age: 7,
    gender: "女児",
    careLevel: "全介助",
    condition: "発達遅延、肢体不自由、けいれん発作",
    medicalCare: "なし",
    service: ["after-school"],
  },
  Y・S: {
    age: 6,
    gender: "女児",
    careLevel: "全介助",
    condition: "症候性てんかん、脳原生上肢機能障害、脳原始移動機能障害",
    medicalCare: "筋緊張（ITB療法中）",
    service: ["after-school"],
  },
  F・M: {
    age: 13,
    gender: "女児",
    careLevel: "全介助",
    condition: "症候性てんかん、股関節亜脱臼、脳原生上肢機能障害、脳原始移動機能障害、側湾症",
    medicalCare: "なし",
    service: ["after-school"],
  },
  N・T: {
    age: 9,
    gender: "男児",
    careLevel: "全介助",
    condition: "発達遅延、神経セロイドリポフスチン8型、両上肢・体感機能障害、てんかん",
    medicalCare: "胃ろう注入",
    service: ["after-school"],
  },
  I・K3: {
    age: 9,
    gender: "不明",
    careLevel: "全介助",
    condition: "脳性麻痺、側弯",
    medicalCare: "胃ろう注入、吸引",
    service: ["after-school"],
  },
  K・Y: {
    age: 9,
    gender: "女児",
    careLevel: "全介助",
    condition: "脳性麻痺、脳原生上肢機能障害、脳原始移動機能障害、側湾症",
    medicalCare: "なし",
    service: ["after-school"],
  },
  S・K2: {
    age: 14,
    gender: "女児",
    careLevel: "全介助",
    condition: "滑脳症、小脳底形成、上腸間膜症候群、症候性てんかん、重度精神運動発達遅滞",
    medicalCare: "経胃ろう十二指腸チューブ、ポートからのCV栄養注入",
    service: ["after-school"],
  },
}

export default function ServiceUsersPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string
  const service = welfareServices[serviceId]

  const [users, setUsers] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    age: 0,
    gender: "不明",
    careLevel: "全介助",
    condition: "",
    medicalCare: "",
  })

  useEffect(() => {
    const filteredUsers = Object.entries(userDetails)
      .filter(([_, details]) => details.service.includes(serviceId))
      .map(([name, _]) => name)

    setUsers(filteredUsers)
  }, [serviceId])

  const handleAddUser = () => {
    if (!newUser.name.trim()) {
      alert("氏名を入力してください")
      return
    }

    userDetails[newUser.name] = {
      age: newUser.age,
      gender: newUser.gender,
      careLevel: newUser.careLevel,
      condition: newUser.condition,
      medicalCare: newUser.medicalCare,
      service: [serviceId],
    }

    setUsers([...users, newUser.name])
    setIsAddDialogOpen(false)
    setNewUser({
      name: "",
      age: 0,
      gender: "不明",
      careLevel: "全介助",
      condition: "",
      medicalCare: "",
    })
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => {
            const details = userDetails[user]

            return (
              <ClickableCard
                key={user}
                onClick={() => router.push(`/services/${serviceId}/users/${encodeURIComponent(user)}`)}
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
                      <CardTitle className="text-lg font-semibold">{user}</CardTitle>
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
                      <span className="font-medium">{details.age}歳</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">性別:</span>
                      <span className="font-medium">{details.gender}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">介護度:</span>
                      <span className="font-medium">{details.careLevel}</span>
                    </div>
                  </div>
                </CardContent>
              </ClickableCard>
            )
          })}
        </div>
      </main>
    </div>
  )
}
