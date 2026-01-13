"use client"

import { useCallback, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { CaseRecordForm } from "@/src/components/case-records/CaseRecordForm"
import { CaseRecordsListClient } from "@/src/components/case-records/CaseRecordsListClient"
import { CareReceiverTemplate } from "@/lib/templates/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataStorageService, type CaseRecord } from "@/services/data-storage-service"
import { CaseRecordFormSchema } from "@/src/lib/case-records/form-schemas"

const MOCK_STAFF_OPTIONS = [
  { value: "staff-1", label: "スタッフA" },
  { value: "staff-2", label: "スタッフB" },
  { value: "staff-3", label: "スタッフC" },
]

export function CaseRecordFormClient({
  careReceiverId,
  careReceiverUuid,
  userId,
  serviceId,
  serviceUuid,
  template,
  initialDate,
  initialTime,
}: {
  careReceiverId: string
  careReceiverUuid: string
  userId: string
  serviceId: string
  serviceUuid: string
  template?: CareReceiverTemplate | null
  initialDate?: string
  initialTime?: string
}) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const submittingRef = useRef(false)

  const dateStr = initialDate ?? ""
  const timeStr = initialTime ?? ""

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
      const validation = CaseRecordFormSchema.safeParse(values)
      if (!validation.success) {
        const issue = validation.error.issues[0]
        const message = issue?.message ?? "必須項目を入力してください"
        console.warn("[CaseRecordFormClient] Validation failed", validation.error.flatten())
        setStatusMessage("入力内容を確認してください")
        toast({
          variant: "destructive",
          title: "入力内容を確認してください",
          description: message,
        })
        return
      }

      const resolvedUserId = values.userId || userId
      const resolvedServiceId = values.serviceId || serviceId

      const record: CaseRecord = {
        userId: resolvedUserId,
        date: values.date,
        entries: [
          { category: "vitals", items: [] },
          { category: "excretion", items: [] },
          { category: "hydration", items: [] },
          { category: "meal", items: [] },
          {
            category: "other",
            items: [
              {
                recordTime: values.time,
                mainStaffId: values.mainStaffId ?? null,
                subStaffIds: values.subStaffIds || [],
                specialNotes: values.specialNotes || "",
                familyNotes: values.familyNotes || "",
                custom: values.custom || {},
              },
            ],
          },
        ],
        meta: {
          recordTime: values.time,
          mainStaffId: values.mainStaffId ?? null,
          subStaffIds: values.subStaffIds || [],
          specialNotes: values.specialNotes || "",
          familyNotes: values.familyNotes || "",
        },
      }

      const saved = await DataStorageService.saveCaseRecord(record, resolvedServiceId)

      console.log("[CaseRecordFormClient] Saved:", saved)

      setStatusMessage("保存しました")

      // Refresh saved list after successful submit
      setListRefreshKey((prev) => prev + 1)

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
    <div className="space-y-8">
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
      
      <div>
        <h2 className="text-lg font-semibold mb-4">新規ケース記録</h2>
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

      <div>
        <CaseRecordsListClient
          serviceId={serviceUuid}
          careReceiverId={careReceiverUuid}
          refreshKey={listRefreshKey}
        />
      </div>
    </div>
  )
}
