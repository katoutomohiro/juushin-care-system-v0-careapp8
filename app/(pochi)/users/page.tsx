"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface PochiUser {
  id: string
  name: string
  scheduleSummary: string
  nextSchedule: string
  timecardStatus: string
  hasTimecard: boolean
}

const USER_GROUPS: { id: string; label: string; users: PochiUser[] }[] = [
  {
    id: "day",
    label: "日勤グループ",
    users: [
      {
        id: "1",
        name: "田中太郎",
        scheduleSummary: "09:00-17:00",
        nextSchedule: "明日 09:00 ケア記録",
        timecardStatus: "未打刻",
        hasTimecard: true,
      },
      {
        id: "2",
        name: "山田花子",
        scheduleSummary: "09:30-16:30",
        nextSchedule: "本日 15:00 リハビリ",
        timecardStatus: "打刻済み",
        hasTimecard: true,
      },
    ],
  },
  {
    id: "evening",
    label: "夕方グループ",
    users: [
      {
        id: "3",
        name: "佐藤健",
        scheduleSummary: "12:00-20:00",
        nextSchedule: "明後日 13:00 外出同行",
        timecardStatus: "打刻不要",
        hasTimecard: false,
      },
      {
        id: "4",
        name: "伊藤蓮",
        scheduleSummary: "13:00-19:00",
        nextSchedule: "来週 10:00 訪問",
        timecardStatus: "未打刻",
        hasTimecard: true,
      },
    ],
  },
]

const FEATURE_FLAG = process.env.NEXT_PUBLIC_FEATURE_POCHI_USERS

const isFeatureEnabled = FEATURE_FLAG === undefined || FEATURE_FLAG === "true" || FEATURE_FLAG === "1"

export default function UsersPage() {
  if (!isFeatureEnabled) {
    return (
      <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>利用者管理</CardTitle>
            <CardDescription>この機能は現在無効化されています。</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  const [selectedGroup, setSelectedGroup] = useState(USER_GROUPS[0]?.id ?? "")
  const [showTimecard, setShowTimecard] = useState(false)

  const users = useMemo(() => {
    const group = USER_GROUPS.find((item) => item.id === selectedGroup)
    return group?.users ?? []
  }, [selectedGroup])

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">利用者管理</h1>
          <p className="text-sm text-muted-foreground">グループ別に利用者を切り替え、予定と打刻の状態を確認します。</p>
        </div>
        <div className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-group">グループ</Label>
            <Select value={selectedGroup} onValueChange={(value) => setSelectedGroup(value)}>
              <SelectTrigger id="user-group">
                <SelectValue placeholder="グループを選択" />
              </SelectTrigger>
              <SelectContent>
                {USER_GROUPS.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="show-timecard"
              checked={showTimecard}
              onCheckedChange={(checked) => setShowTimecard(checked === true)}
            />
            <Label htmlFor="show-timecard" className="cursor-pointer">
              タイムカードを表示
            </Label>
          </div>
        </div>
      </header>

      <section aria-labelledby="users-section" className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="users-section" className="text-lg font-medium">
              利用者一覧
            </h2>
            <p className="text-sm text-muted-foreground">予定カレンダーと打刻アクションの骨子を確認できます。</p>
          </div>
          <Button variant="outline">利用者を追加</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {users.map((user) => (
            <Card key={user.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>予定: {user.scheduleSummary}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">予定カレンダー</h3>
                  <p className="text-base">{user.nextSchedule}</p>
                </div>
                {showTimecard && (
                  <div className="flex flex-col gap-2">
                    <Separator />
                    <h3 className="text-sm font-medium text-muted-foreground">打刻</h3>
                    {user.hasTimecard ? (
                      <>
                        <p className="text-base">{user.timecardStatus}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            出勤
                          </Button>
                          <Button size="sm" variant="outline">
                            退勤
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-base text-muted-foreground">タイムカード対象外の利用者です。</p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button size="sm" variant="ghost">
                  詳細
                </Button>
                <Button size="sm">予定を編集</Button>
              </CardFooter>
            </Card>
          ))}
          {users.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>表示する利用者がいません</CardTitle>
                <CardDescription>条件を変更して再度お試しください。</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
