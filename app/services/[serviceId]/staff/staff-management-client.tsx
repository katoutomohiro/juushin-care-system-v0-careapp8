"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Staff {
  id: string
  name: string
  sort_order: number
  is_active: boolean
}

export function StaffManagementClient({
  serviceId,
  serviceSlug: _serviceSlug,
}: {
  serviceId: string
  serviceSlug: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", sortOrder: 0, isActive: true })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchStaff()
  }, [serviceId])

  const fetchStaff = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/staff?serviceId=${serviceId}&activeOnly=false`, {
        cache: "no-store",
      })
      const result = await response.json()

      if (response.ok && (result.staff || Array.isArray(result))) {
        const list: Staff[] = Array.isArray(result) ? result : result.staff
        setStaff(list.map((s) => ({
          ...s,
          sort_order: (s as any).sortOrder ?? s.sort_order ?? 0,
          is_active: (s as any).isActive ?? s.is_active,
        })))
      } else {
        toast({
          variant: "destructive",
          title: "職員データの取得に失敗しました",
          description: result.error || "もう一度お試しください",
        })
      }
    } catch (error) {
      console.error("[StaffManagementClient] Error:", error)
      toast({
        variant: "destructive",
        title: "職員データの取得に失敗しました",
        description: "ネットワーク接続を確認してください",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (s: Staff) => {
    setEditingId(s.id)
    setEditForm({
      name: s.name,
      sortOrder: s.sort_order,
      isActive: s.is_active,
    })
  }

  const addNewRow = () => {
    const nextSort = staff.length > 0 ? Math.max(...staff.map((s) => s.sort_order || 0)) + 1 : 1
    const tempId = `temp-${crypto.randomUUID?.() || Date.now()}`
    const newRow: Staff = {
      id: tempId,
      name: "",
      sort_order: nextSort,
      is_active: true,
    }
    setStaff((prev) => [...prev, newRow])
    setEditingId(tempId)
    setEditForm({ name: "", sortOrder: nextSort, isActive: true })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: "", sortOrder: 0, isActive: true })
  }

  const saveEdit = async (id: string) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          id: id.startsWith("temp-") ? undefined : id,
          name: editForm.name,
          sortOrder: editForm.sortOrder,
          isActive: editForm.isActive,
        }),
      })

      const result = await response.json()

      if (response.ok && result.ok) {
        const staffName = result.staff?.name || editForm.name
        toast({
          title: "✅ 保存しました",
          description: staffName ? `${staffName} の情報を更新しました` : "職員情報を更新しました",
        })
        setEditingId(null)
        await fetchStaff()
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "保存に失敗しました",
          description: result.error || "もう一度お試しください",
        })
      }
    } catch (error) {
      console.error("[StaffManagementClient] Save error:", error)
      toast({
        variant: "destructive",
        title: "保存に失敗しました",
        description: "ネットワーク接続を確認してください",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>職員一覧</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>職員一覧 ({staff.length}人)</CardTitle>
          <Button size="sm" onClick={addNewRow} variant="outline">
            ＋ 新規追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">表示順</TableHead>
              <TableHead>職員名</TableHead>
              <TableHead className="w-[100px]">有効</TableHead>
              <TableHead className="w-[150px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => {
              const isEditing = editingId === s.id

              return (
                <TableRow key={s.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.sortOrder}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="w-16"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">{s.sort_order}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="max-w-xs"
                        autoFocus
                      />
                    ) : (
                      <span className={s.is_active ? "font-medium" : "text-muted-foreground line-through"}>
                        {s.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Switch
                        checked={editForm.isActive}
                        onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, isActive: checked }))}
                      />
                    ) : (
                      <span className={s.is_active ? "text-green-600" : "text-gray-400"}>
                        {s.is_active ? "✓" : "✗"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(s.id)}
                          disabled={isSaving || !editForm.name.trim()}
                        >
                          {isSaving ? "保存中..." : "保存"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving}>
                          キャンセル
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                        編集
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        
        {staff.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>職員データが登録されていません</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
