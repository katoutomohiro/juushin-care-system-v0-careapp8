"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { CaseRecordForm } from "@/src/components/case-records/CaseRecordForm"
import { CareReceiverTemplate } from "@/lib/templates/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MOCK_STAFF_OPTIONS = [
  { value: "staff-1", label: "スタッフA" },
  { value: "staff-2", label: "スタッフB" },
  { value: "staff-3", label: "スタッフC" },
]

export function CaseRecordFormClient({
  careReceiverId,
  userId,
  serviceId,
  template,
}: {
  careReceiverId: string
  userId: string
  serviceId: string
  template?: CareReceiverTemplate | null
}) {
  const { toast } = useToast()
  const [_isSubmitting, _setIsSubmitting] = useState(false)

  // Get current date and time
  const now = new Date()
  const dateStr = now.toISOString().split("T")[0]
  const timeStr = now.toTimeString().split(" ")[0].substring(0, 5)

  const handleSubmit = async (values: any) => {
    try {
      _setIsSubmitting(true)
      console.log("[CaseRecordFormClient] Submitting:", values)

      // TODO: Send to API or localStorage
      toast({
        variant: "default",
        title: "ケース記録を保存しました",
        description: `${careReceiverId} の記録が正常に保存されました`,
      })
    } catch (error) {
      console.error("[CaseRecordFormClient] Submit error:", error)
      toast({
        variant: "destructive",
        title: "保存に失敗しました",
        description: "もう一度お試しください",
      })
    } finally {
      _setIsSubmitting(false)
    }
  }

  // If template not found, show message
  if (!template) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">テンプレート未設定</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-800">
            利用者 {careReceiverId} のケース記録テンプレートが見つかりません。
            <br />
            管理者にお問い合わせください。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <CaseRecordForm
      initial={{
        date: dateStr,
        time: timeStr,
        userId: userId,
        serviceId: serviceId,
        mainStaffId: null,
        subStaffIds: [],
        specialNotes: "",
        familyNotes: "",
        custom: {},
      }}
      staffOptions={MOCK_STAFF_OPTIONS}
      templateFields={template.customFields || []}
      onSubmit={handleSubmit}
      submitLabel="保存"
    />
  )
}
