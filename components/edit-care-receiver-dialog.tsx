"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type CareReceiverData = {
  id: string
  display_name?: string
  full_name?: string
  birthday?: string | null
  gender?: string | null
  address?: string | null
  phone?: string | null
  emergency_contact?: string | null
  notes?: string | null
  medical_care_detail?: any
  version?: number
}

type UserRole = "staff" | "nurse" | "admin" | "anon"

type Props = {
  careReceiver: CareReceiverData
  userRole?: UserRole  // 🔐 権限ベース表示制御
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditCareReceiverDialog({ careReceiver, userRole = "staff", isOpen, onClose, onSuccess }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false)

  // フォーム状態
  const [displayName, setDisplayName] = useState(careReceiver.display_name || "")
  const [fullName, setFullName] = useState(careReceiver.full_name || "")
  const [birthday, setBirthday] = useState(careReceiver.birthday || "")
  const [gender, setGender] = useState(careReceiver.gender || "")
  const [address, setAddress] = useState(careReceiver.address || "")
  const [phone, setPhone] = useState(careReceiver.phone || "")
  const [emergencyContact, setEmergencyContact] = useState(careReceiver.emergency_contact || "")
  const [notes, setNotes] = useState(careReceiver.notes || "")

  // 医療的ケア（チェックボックス + 自由入力）
  const [medicalCareDetail, setMedicalCareDetail] = useState<any>(
    careReceiver.medical_care_detail || {}
  )

  const handleMedicalCareChange = (key: string, value: boolean | string) => {
    setMedicalCareDetail((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/care-receivers/${careReceiver.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: careReceiver.version,  // 🔐 楽観ロック
          display_name: displayName,
          full_name: fullName,
          birthday: birthday || null,
          gender: gender || null,
          address: address,
          phone: phone,
          emergency_contact: emergencyContact,
          notes: notes,
          medical_care_detail: medicalCareDetail,
        }),
      })

      const result = await response.json()

      // 🔐 409 Conflict: 他のユーザーが先に更新済み
      if (response.status === 409) {
        setConflictDialogOpen(true)
        toast({
          variant: "destructive",
          title: "⚠️ 他のユーザーが先に更新しています",
          description: "最新のデータを再読み込みしてください",
        })
        return
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "保存に失敗しました")
      }

      toast({
        variant: "default",
        title: "✅ 利用者情報を更新しました",
        description: `${displayName || fullName} の情報を保存しました`,
      })

      onSuccess()  // 親コンポーネントで再フェッチ
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      toast({
        variant: "destructive",
        title: "❌ 保存エラー",
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>利用者情報を編集</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 表示名 */}
            <div>
              <Label htmlFor="display_name">表示名（匿名表示可）*</Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例: AT, User-001"
              />
              <p className="text-xs text-muted-foreground mt-1">
                アプリUI表示用の名前（匿名表示可能）
              </p>
            </div>

            {/* 実名（staff/nurse/admin のみ表示） */}
            {(userRole === "staff" || userRole === "nurse" || userRole === "admin") && (
              <div>
                <Label htmlFor="full_name">実名</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="例: 山田 太郎"
                  disabled={userRole === "staff"}  // staff は読み取り専用
                />
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ 個人情報: ログに出力されません
                </p>
              </div>
            )}

            {/* 生年月日（staff/nurse/admin のみ表示） */}
            {(userRole === "staff" || userRole === "nurse" || userRole === "admin") && (
              <div>
                <Label htmlFor="birthday">生年月日</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  disabled={userRole === "staff"}
                />
              </div>
            )}

            {/* 性別（staff/nurse/admin のみ表示） */}
            {(userRole === "staff" || userRole === "nurse" || userRole === "admin") && (
              <div>
                <Label htmlFor="gender">性別</Label>
                <Select value={gender} onValueChange={setGender} disabled={userRole === "staff"}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">未設定</SelectItem>
                    <SelectItem value="male">男性</SelectItem>
                    <SelectItem value="female">女性</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 住所（admin のみ表示） */}
            {userRole === "admin" && (
              <div>
                <Label htmlFor="address">住所</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例: 東京都渋谷区..."
                />
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ 個人情報（管理者のみ）
                </p>
              </div>
            )}

            {/* 電話番号（admin のみ表示） */}
            {userRole === "admin" && (
              <div>
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="例: 03-1234-5678"
                />
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ 個人情報（管理者のみ）
                </p>
              </div>
            )}

            {/* 緊急連絡先（admin のみ表示） */}
            {userRole === "admin" && (
              <div>
                <Label htmlFor="emergency_contact">緊急連絡先</Label>
                <Textarea
                  id="emergency_contact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="例: 母親 090-1234-5678 / 父親 080-9876-5432"
                  rows={2}
                    />
                    <Label htmlFor="tube_feeding" className="font-normal">経管栄養</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="suctioning"
                      checked={medicalCareDetail.suctioning || false}
                      onChange={(e) => handleMedicalCareChange("suctioning", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="suctioning" className="font-normal">吸引</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="oxygen"
                      checked={medicalCareDetail.oxygen || false}
                      onChange={(e) => handleMedicalCareChange("oxygen", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="oxygen" className="font-normal">酸素吸入</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ventilator"
                      checked={medicalCareDetail.ventilator || false}
                      onChange={(e) => handleMedicalCareChange("ventilator", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="ventilator" className="font-normal">人工呼吸器</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="seizure_care"
                      checked={medicalCareDetail.seizure_care || false}
                      onChange={(e) => handleMedicalCareChange("seizure_care", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="seizure_care" className="font-normal">発作対応</Label>
                  </div>

                  <div className="mt-3">
                    <Label htmlFor="medical_care_notes" className="text-sm">その他の医療的ケア</Label>
                    <Textarea
                      id="medical_care_notes"
                      value={medicalCareDetail.notes || ""}
                      onChange={(e) => handleMedicalCareChange("notes", e.target.value)}
                      placeholder="例: 特殊な薬剤、アレルギー情報など"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* メモ（全員表示） */}
            <div>
              <Label htmlFor="notes">メモ（自由記述）</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="その他の特記事項"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔐 409 Conflict ダイアログ */}
      <AlertDialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ 他のユーザーが先に更新しています</AlertDialogTitle>
            <AlertDialogDescription>
              保存しようとした情報は、他の職員が既に更新しています。
              最新のデータを再読み込みしてから、再度編集してください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>閉じる</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConflictDialogOpen(false)
                onSuccess()  // 親で最新データを再フェッチ
                onClose()
              }}
            >
              最新データを再読み込み
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
