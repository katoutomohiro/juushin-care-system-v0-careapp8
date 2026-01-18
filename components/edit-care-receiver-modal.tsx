'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  updateCareReceiverAction,
  deleteCareReceiverAction,
} from '@/lib/actions/care-receivers'

interface CareReceiver {
  id: string
  code: string
  name: string
  age?: number
  gender?: string
  care_level?: number
  condition?: string
  medical_care?: string
  is_active?: boolean
}

interface EditCareReceiverModalProps {
  user: CareReceiver
  serviceCode: string
}

export function EditCareReceiverModal({
  user,
  serviceCode,
}: EditCareReceiverModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState(user)

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
      const result = await updateCareReceiverAction(user.id, {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        care_level: formData.care_level,
        condition: formData.condition,
        medical_care: formData.medical_care,
      })

      if (result.ok) {
        setOpen(false)
        // Refresh current page to show updated data
        router.refresh()
      } else {
        setError(result.error || '保存に失敗しました')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('本当に削除しますか？この操作は取り消せません。')) {
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const result = await deleteCareReceiverAction(user.id)

      if (result.ok) {
        setOpen(false)
        router.push(`/services/${serviceCode}/users`)
      } else {
        setError(result.error || '削除に失敗しました')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2">
          編集
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>利用者情報を編集</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">エラー</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">ID（コード）</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500">変更不可（システムID）</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">氏名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">年齢</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) =>
                handleFieldChange('age', e.target.value ? parseInt(e.target.value) : undefined)
              }
              disabled={isSaving}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">性別</Label>
            <Input
              id="gender"
              value={formData.gender || ''}
              onChange={(e) => handleFieldChange('gender', e.target.value)}
              placeholder="男 / 女 など"
              disabled={isSaving}
            />
          </div>

          {/* Care Level */}
          <div className="space-y-2">
            <Label htmlFor="care_level">ケアレベル</Label>
            <Input
              id="care_level"
              type="number"
              value={formData.care_level || ''}
              onChange={(e) =>
                handleFieldChange(
                  'care_level',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              disabled={isSaving}
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">疾患・症状</Label>
            <Textarea
              id="condition"
              value={formData.condition || ''}
              onChange={(e) => handleFieldChange('condition', e.target.value)}
              disabled={isSaving}
              rows={3}
            />
          </div>

          {/* Medical Care */}
          <div className="space-y-2">
            <Label htmlFor="medical_care">医療ケア</Label>
            <Textarea
              id="medical_care"
              value={formData.medical_care || ''}
              onChange={(e) => handleFieldChange('medical_care', e.target.value)}
              disabled={isSaving}
              rows={3}
            />
          </div>

          {/* Is Active (Logical Deletion) */}
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active !== false}
              onChange={(e) => handleFieldChange('is_active', e.target.checked)}
              disabled={isSaving}
              className="w-4 h-4 rounded"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              アクティブ（無効にするとリストから非表示）
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 border-t pt-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            削除
          </Button>
          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
