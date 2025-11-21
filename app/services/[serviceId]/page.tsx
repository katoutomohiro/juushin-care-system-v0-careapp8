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
import { userDetails } from "@/lib/user-master-data"
import { filterUsersByService, serviceConfig, ServiceType, calculateServicesForUser } from "@/lib/user-service-allocation"



export default function ServiceUsersPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as ServiceType
  const service = serviceConfig[serviceId]

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
    // 年齢ベースのフィルタリング適用
    const filteredUsers = filterUsersByService(userDetails, serviceId).slice(0, 16)
    setUsers(filteredUsers.map(([userId, _]) => userId))
  }, [serviceId])

  const handleAddUser = () => {
    if (!newUser.name.trim()) {
      alert("氏名を入力してください")
      return
    }

    // 年齢ベースでサービスを自動配置
    const calculatedServices = calculateServicesForUser(newUser.age)
    
    userDetails[newUser.name] = {
      name: newUser.name,
      age: newUser.age,
      gender: newUser.gender,
      careLevel: newUser.careLevel,
      condition: newUser.condition,
      medicalCare: newUser.medicalCare,
      service: calculatedServices,
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
