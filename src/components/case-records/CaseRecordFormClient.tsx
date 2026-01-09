"use client"

import { useCallback, useRef, useState } from "react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const submittingRef = useRef(false)

  // Get current date and time
  const now = new Date()
  const dateStr = now.toISOString().split("T")[0]
  const timeStr = now.toTimeString().split(" ")[0].substring(0, 5)

  const handleSubmit = useCallback(async (values: any) => {
    // Double-submit guard: prevent concurrent submissions
    if (submittingRef.current) {
      console.warn("[CaseRecordFormClient] Already submitting, ignoring duplicate call")
      return
    }
    submittingRef.current = true
    setIsSubmitting(true)
    setStatusMessage(null)
    
    try {
      console.log("[CaseRecordFormClient] Submitting:", values)

      // Send to API
      const response = await fetch("/api/case-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          serviceId: serviceId,
          recordDate: values.date,
          recordTime: values.time,
          mainStaffId: values.mainStaffId,
          subStaffIds: values.subStaffIds || [],
          payload: {
            specialNotes: values.specialNotes || "",
            familyNotes: values.familyNotes || "",
            custom: values.custom || {},
          },
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "保存に失敗しました")
      }

      console.log("[CaseRecordFormClient] Saved:", result.record)

      setStatusMessage("保存しました")

      toast({
        variant: "default",
        title: "✅ ケース記録を保存しました",
        description: `${careReceiverId} の記録が正常に保存されました (${new Date().toLocaleTimeString("ja-JP")})`,
      })
    } catch (error) {
      console.error("[CaseRecordFormClient] Submit error:", error)
      setStatusMessage("保存に失敗しました")
      toast({
        variant: "destructive",
        title: "保存に失敗しました",
        description: error instanceof Error ? error.message : "もう一度お試しください",
      })
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careReceiverId, serviceId, userId])

  // If template not found, show diagnostic message
  if (!template) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">テンプレート未設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-amber-800">
            利用者 <strong>{careReceiverId}</strong> のケース記録テンプレートが見つかりません。
          </p>
          <div className="text-sm text-amber-700 bg-amber-100 p-3 rounded">
            <p className="font-semibold mb-1">診断情報:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>正規化ID: {careReceiverId}</li>
              <li>元のID: {userId}</li>
              <li>サービス: {serviceId}</li>
            </ul>
            <p className="mt-2 text-xs">
              ※ 現在サポートされているテンプレート: AT（A・T様専用）
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {statusMessage && (
        <div
          className={`px-4 py-3 rounded ${
            statusMessage === "保存しました"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {statusMessage}
        </div>
      )}
      
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
        submitLabel={isSubmitting ? "保存中..." : "保存"}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
