'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, Plus, Loader2 } from 'lucide-react'
import { createCareReceiverAction } from '@/lib/actions/care-receivers'

interface CreateCareReceiverModalProps {
  serviceCode: string
}

export function CreateCareReceiverModal({
  serviceCode,
}: CreateCareReceiverModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    age: undefined as number | undefined,
    gender: '',
    care_level: undefined as number | undefined,
    condition: '',
    medical_care: '',
  })

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    setError(null)

    // Validation
    if (!formData.code.trim()) {
      setError('ID（コード）は必須です')
      return
    }
    if (!formData.name.trim()) {
      setError('氏名は必須です')
      return
    }

    setIsSaving(true)

    try {
      const result = await createCareReceiverAction({
        code: formData.code.trim(),
        name: formData.name.trim(),
        service_code: serviceCode,
        age: formData.age,
        gender: formData.gender.trim() || undefined,
        care_level: formData.care_level,
        condition: formData.condition.trim() || undefined,
        medical_care: formData.medical_care.trim() || undefined,
      })

      if (result.ok) {
        setOpen(false)
        // Reset form
        setFormData({
          code: '',
          name: '',
          age: undefined,
          gender: '',
          care_level: undefined,
          condition: '',
          medical_care: '',
        })
        // Refresh page to show new user
        router.refresh()
      } else {
        setError(result.error || '作成に失敗しました')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setError(null)
      // Reset form when opening
      setFormData({
        code: '',
        name: '',
        age: undefined,
        gender: '',
        care_level: undefined,
        condition: '',
        medical_care: '',
      })
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新規追加
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>新規利用者を追加</DialogTitle>
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
            <Label htmlFor="new-code">ID（コード） *</Label>
            <Input
              id="new-code"
              value={formData.code}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              disabled={isSaving}
              placeholder="e.g., AT_36M"
              required
            />
            <p className="text-xs text-gray-500">一意の識別子（変更不可）</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="new-name">氏名 *</Label>
            <Input
              id="new-name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              disabled={isSaving}
              placeholder="e.g., 太郎"
              required
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="new-age">年齢</Label>
            <Input
              id="new-age"
              type="number"
              value={formData.age || ''}
              onChange={(e) =>
                handleFieldChange('age', e.target.value ? parseInt(e.target.value) : undefined)
              }
              disabled={isSaving}
              min="0"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="new-gender">性別</Label>
            <Input
              id="new-gender"
              value={formData.gender}
              onChange={(e) => handleFieldChange('gender', e.target.value)}
              placeholder="男 / 女 / その他"
              disabled={isSaving}
            />
          </div>

          {/* Care Level */}
          <div className="space-y-2">
            <Label htmlFor="new-care_level">ケアレベル</Label>
            <Input
              id="new-care_level"
              type="number"
              value={formData.care_level || ''}
              onChange={(e) =>
                handleFieldChange(
                  'care_level',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              disabled={isSaving}
              min="0"
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="new-condition">疾患・症状</Label>
            <Textarea
              id="new-condition"
              value={formData.condition}
              onChange={(e) => handleFieldChange('condition', e.target.value)}
              disabled={isSaving}
              rows={2}
            />
          </div>

          {/* Medical Care */}
          <div className="space-y-2">
            <Label htmlFor="new-medical_care">医療ケア</Label>
            <Textarea
              id="new-medical_care"
              value={formData.medical_care}
              onChange={(e) => handleFieldChange('medical_care', e.target.value)}
              disabled={isSaving}
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            作成
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
