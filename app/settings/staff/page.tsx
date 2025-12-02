"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Staff = { id: string; name: string; is_active: boolean }

export default function StaffSettingsPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      const res = await fetch("/api/staff", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "取得に失敗しました")
      setStaff(json.staff || [])
    } catch (e: any) {
      setError(e?.message || "取得に失敗しました")
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "保存に失敗しました")
      setName("")
      await load()
    } catch (e: any) {
      setError(e?.message || "保存に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (member: Staff) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, is_active: !member.is_active }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "更新に失敗しました")
      await load()
    } catch (e: any) {
      setError(e?.message || "更新に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleRename = async (member: Staff, nextName: string) => {
    if (!nextName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, name: nextName.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "更新に失敗しました")
      await load()
    } catch (e: any) {
      setError(e?.message || "更新に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">職員マスタ</h1>
        <p className="text-sm text-muted-foreground">
          担当者を登録・更新します（A・T ケース記録の「担当」プルダウンで利用）。
        </p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>新規追加</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>氏名</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 山田 太郎" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} disabled={loading || !name.trim()}>
                追加
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>職員一覧</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {staff.length === 0 && <div className="text-sm text-muted-foreground">登録された職員がありません。</div>}
          {staff.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-1 md:grid-cols-6 items-center gap-3 border rounded-lg p-3 bg-white shadow-sm"
            >
              <div className="md:col-span-3">
                <Label className="text-xs text-muted-foreground">氏名</Label>
                <Input
                  defaultValue={member.name}
                  onBlur={(e) => {
                    const next = e.target.value.trim()
                    if (next && next !== member.name) {
                      handleRename(member, next)
                    } else {
                      e.target.value = member.name
                    }
                  }}
                />
              </div>
              <div className="md:col-span-2 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    member.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {member.is_active ? "有効" : "無効"}
                </span>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleToggle(member)} disabled={loading}>
                  {member.is_active ? "無効化" : "有効化"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
