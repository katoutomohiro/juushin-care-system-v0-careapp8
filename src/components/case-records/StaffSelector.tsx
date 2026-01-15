"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

// 未選択を表現するダミー値
const NONE = "__none__"

export type StaffOption = { value: string; label: string }

export type StaffSelectorProps = {
  mainStaffId: string | null | undefined
  subStaffId: string | null | undefined
  options: StaffOption[]
  onChange: (patch: { mainStaffId?: string | null; subStaffId?: string | null }) => void
  validationError?: string | null  // エラーメッセージ
  serviceId?: string  // 編集モード時に PUT に必要
  allStaff?: Array<{ id: string; name: string; sort_order: number; is_active: boolean }> // 編集用に全情報が欲しい
}

export function StaffSelector({
  mainStaffId,
  subStaffId,
  options,
  onChange,
  validationError,
  serviceId,
  allStaff = [],
}: StaffSelectorProps) {
  const { toast } = useToast()
  const hasError = !!validationError
  
  // UI 値: NONE or uuid
  const mainSelectValue = mainStaffId ?? NONE
  const subSelectValue = subStaffId ?? NONE
  
  // 編集モード状態
  const [editMode, setEditMode] = useState(false)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ staffId: string; message: string } | null>(null)
  
  const handleMainChange = (v: string) => {
    onChange({ mainStaffId: v === NONE ? null : v })
  }
  
  const handleSubChange = (v: string) => {
    onChange({ subStaffId: v === NONE ? null : v })
  }

  const handleEditStart = (staffId: string, currentName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingStaffId(staffId)
    setEditingName(currentName)
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingStaffId(null)
    setEditingName("")
  }

  const handleSaveStaffName = async (staffId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!editingName.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "スタッフ名は空白にできません",
      })
      return
    }

    if (!serviceId) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サービスIDが不明です",
      })
      return
    }

    setIsSaving(true)
    try {
      // 現在の sort_order と is_active を取得（allStaff から検索）
      const staffData = allStaff.find((s) => s.id === staffId)
      const sortOrder = staffData?.sort_order ?? 0
      const isActive = staffData?.is_active ?? true

      const response = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          id: staffId,
          name: editingName.trim(),
          sortOrder,
          isActive,
        }),
      })

      const result = await response.json()

      if (response.ok && result.ok) {
        // 保存成功: UI を更新
        setSaveStatus({ staffId, message: "保存しました" })
        setTimeout(() => setSaveStatus(null), 2000)
        
        setEditingStaffId(null)
        setEditingName("")

        toast({
          title: "保存成功",
          description: `${editingName} を保存しました`,
        })
      } else {
        const errorMsg = result.error || "保存に失敗しました"
        toast({
          variant: "destructive",
          title: "保存失敗",
          description: errorMsg,
        })
      }
    } catch (error) {
      console.error("[StaffSelector] Save error:", error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ネットワーク接続を確認してください",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Main Select Content
  const MainSelectContent = () => (
    <SelectContent>
      {editMode && (
        <div className="px-2 py-2 border-b space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">編集モード</span>
            <Switch checked={editMode} onCheckedChange={setEditMode} />
          </div>
        </div>
      )}
      {!editMode && (
        <div className="px-2 py-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditMode(true)
            }}
          >
            ✏️ スタッフ名を編集
          </Button>
        </div>
      )}

      {editMode ? (
        // 編集モード: 各スタッフをテキストフィールド + 保存ボタンで表示
        <div className="space-y-1">
          <SelectItem value={NONE}>（未選択）</SelectItem>
          {options.map((opt) => (
            <div
              key={opt.value}
              className="px-2 py-1.5 rounded hover:bg-gray-50 border-b last:border-b-0"
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
            >
              {editingStaffId === opt.value ? (
                // 編集中
                <div className="flex items-center gap-1">
                  <Input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-7 text-xs"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isSaving}
                    onClick={(e) => handleSaveStaffName(opt.value, e)}
                  >
                    {isSaving ? "保存中…" : "保存"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleCancelEdit}
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                // 表示モード
                <div className="flex items-center justify-between">
                  <span className="text-sm">{opt.label}</span>
                  {saveStatus?.staffId === opt.value && (
                    <span className="text-xs text-green-600">{saveStatus.message}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1 text-xs"
                    onClick={(e) => handleEditStart(opt.value, opt.label, e)}
                  >
                    編集
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // 通常モード: SelectItem で選択できる
        <>
          <SelectItem value={NONE}>（未選択）</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </>
      )}
    </SelectContent>
  )

  // Sub Select Content（同じ構造）
  const SubSelectContent = () => (
    <SelectContent>
      {editMode && (
        <div className="px-2 py-2 border-b space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">編集モード</span>
            <Switch checked={editMode} onCheckedChange={setEditMode} />
          </div>
        </div>
      )}
      {!editMode && (
        <div className="px-2 py-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditMode(true)
            }}
          >
            ✏️ スタッフ名を編集
          </Button>
        </div>
      )}

      {editMode ? (
        // 編集モード
        <div className="space-y-1">
          <SelectItem value={NONE}>（未選択）</SelectItem>
          {options.map((opt) => (
            <div
              key={opt.value}
              className="px-2 py-1.5 rounded hover:bg-gray-50 border-b last:border-b-0"
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
            >
              {editingStaffId === opt.value ? (
                <div className="flex items-center gap-1">
                  <Input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-7 text-xs"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isSaving}
                    onClick={(e) => handleSaveStaffName(opt.value, e)}
                  >
                    {isSaving ? "保存中…" : "保存"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleCancelEdit}
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{opt.label}</span>
                  {saveStatus?.staffId === opt.value && (
                    <span className="text-xs text-green-600">{saveStatus.message}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1 text-xs"
                    onClick={(e) => handleEditStart(opt.value, opt.label, e)}
                  >
                    編集
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <SelectItem value={NONE}>（未選択）</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </>
      )}
    </SelectContent>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">主担当</label>
        <Select value={mainSelectValue} onValueChange={handleMainChange}>
          <SelectTrigger
            className={`${
              hasError ? "border-red-500 bg-red-50" : ""
            }`}
            aria-label="主担当を選択"
          >
            <SelectValue placeholder="（未選択）" />
          </SelectTrigger>
          <MainSelectContent />
        </Select>
        {hasError ? (
          <p className="text-sm text-red-600 mt-1">{validationError}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">※主担当は自動で設定されます（必要に応じて変更できます）</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">副担当</label>
        <Select value={subSelectValue} onValueChange={handleSubChange}>
          <SelectTrigger aria-label="副担当を選択">
            <SelectValue placeholder="（未選択）" />
          </SelectTrigger>
          <SubSelectContent />
        </Select>
      </div>
    </div>
  )
}
