"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { CaseRecordForm } from "@/src/components/case-records/CaseRecordForm"
import { CaseRecordsListClient } from "@/src/components/case-records/CaseRecordsListClient"
import { CareReceiverTemplate } from "@/lib/templates/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MOCK_STAFF_OPTIONS = [
  { value: "staff-1", label: "スタッフA" },
  { value: "staff-2", label: "スタッフB" },
  { value: "staff-3", label: "スタッフC" },
]

export function CaseRecordFormClient({
  careReceiverId,
  careReceiverUuid,
  careReceiverName,
  userId,
  serviceId,
  serviceUuid,
  template,
  initialDate,
}: {
  careReceiverId: string
  careReceiverUuid: string
  careReceiverName: string
  userId: string
  serviceId: string
  serviceUuid: string
  template?: CareReceiverTemplate | null
  initialDate?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<{ mainStaffId?: string }>({})
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([])
  const [allStaff, setAllStaff] = useState<Array<{ id: string; name: string; sort_order: number; is_active: boolean }>>([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(true)
  const submittingRef = useRef(false)
  const didFetchStaffRef = useRef(false)

  const dateStr = initialDate ?? ""

  // Fetch staff options from database
  useEffect(() => {
    if (didFetchStaffRef.current) return
    didFetchStaffRef.current = true

    const fetchStaff = async () => {
      try {
        // 修正: fetch → createRouteHandlerClient(cookies) で自動バインド
        // anon key + RLS で service_id フィルタリング自動適用
        const response = await fetch(`/api/staff?serviceId=${serviceUuid || serviceId}&activeOnly=true`, { cache: "no-store" })
        const result = await response.json()

        if (response.ok && result.ok && result.staffOptions) {
          setStaffOptions(result.staffOptions)
          if (Array.isArray(result.staff)) {
            setAllStaff(
              result.staff.map((s: any) => ({
                id: s.id,
                name: s.name,
                sort_order: s.sortOrder ?? s.sort_order ?? 0,
                is_active: s.isActive ?? s.is_active ?? true,
              }))
            )
          }
        } else {
          console.error("[CaseRecordFormClient] Failed to fetch staff:", result.error)
          toast({
            variant: "destructive",
            title: "職員データの取得に失敗しました",
            description: result.error || "もう一度お試しください",
          })
        }
      } catch (error) {
        console.error("[CaseRecordFormClient] Error fetching staff:", error)
        toast({
          variant: "destructive",
          title: "職員データの取得に失敗しました",
          description: "ネットワーク接続を確認してください",
        })
      } finally {
        setIsLoadingStaff(false)
      }
    }

    void fetchStaff()
  }, [serviceId, serviceUuid, toast])

  // Handle staff option update from StaffSelector
  const handleUpdateStaff = useCallback(
    (staff: { id: string; name: string; sort_order?: number; is_active?: boolean }) => {
      setStaffOptions((prev) =>
        prev.map((opt) =>
          opt.value === staff.id ? { ...opt, label: staff.name } : opt
        )
      )
      setAllStaff((prev) =>
        prev.map((s) =>
          s.id === staff.id
            ? {
                ...s,
                name: staff.name,
                sort_order: staff.sort_order ?? s.sort_order,
                is_active: staff.is_active ?? s.is_active,
              }
            : s
        )
      )
    },
    []
  )

  const handleSubmit = useCallback(async (values: any) => {
    // Double-submit guard: prevent concurrent submissions
    if (submittingRef.current) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[CaseRecordFormClient] Already submitting, ignoring duplicate call")
      }
      return
    }
    submittingRef.current = true
    setIsSubmitting(true)
    setStatusMessage(null)
    setFieldErrors([])
    
    try {
      console.log("[CaseRecordFormClient] Submitting:", values)

      // Send to API
      const response = await fetch("/api/case-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceId,
          user_id: userId,
          record_date: values.date,
          record_data: {
            recordTime: values.time,
            mainStaffId: values.mainStaffId,
            subStaffIds: values.subStaffIds || [],
            specialNotes: values.specialNotes || "",
            familyNotes: values.familyNotes || "",
            custom: values.custom || {},
          },
        }),
      })

      let result: any
      try {
        result = await response.json()
      } catch {
        console.error("[CaseRecordFormClient] Invalid JSON response", {
          status: response.status,
          statusText: response.statusText,
        })
        throw new Error("保存に失敗しました")
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "保存に失敗しました")
      }

      console.log("[CaseRecordFormClient] Saved:", result.record)

      setStatusMessage("保存しました")
      setFieldErrors([])
      setValidationErrors({})

      // Refresh saved list after successful submit
      setListRefreshKey((prev) => prev + 1)

      // Ensure latest data reflects saved values
      router.refresh()

      toast({
        variant: "default",
        title: "✅ ケース記録を保存しました",
        description: `${careReceiverName || careReceiverId} の記録が正常に保存されました (${new Date().toLocaleTimeString("ja-JP")})`,
      })
    } catch (error) {
      console.error("[CaseRecordFormClient] Submit error:", error)
      setStatusMessage("保存に失敗しました")
      if (error instanceof Error && error.message) {
        setFieldErrors((prev) => prev.length ? prev : [error.message])
      }
      toast({
        variant: "destructive",
        title: "保存に失敗しました",
        description: error instanceof Error ? error.message : "もう一度お試しください",
      })
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }, [careReceiverId, careReceiverName, careReceiverUuid, router, serviceId, serviceUuid, userId])

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
      {fieldErrors.length > 0 && (
        <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-red-800">
          <p className="font-semibold mb-1">入力エラー</p>
          <ul className="list-disc list-inside space-y-0.5">
            {fieldErrors.map((err, idx) => (
              <li key={`${err}-${idx}`}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div>
        <h2 className="text-lg font-semibold mb-4">新規ケース記録</h2>
        {isLoadingStaff ? (
          <div className="px-4 py-3 rounded bg-blue-50 border border-blue-200 text-blue-800">
            職員データを読み込み中...
          </div>
        ) : staffOptions.length === 0 ? (
          <div className="px-4 py-3 rounded bg-amber-50 border border-amber-200 text-amber-800">
            職員データが登録されていません。管理者に連絡してください。
          </div>
        ) : (
          <CaseRecordForm
            initial={{
              date: dateStr,
              careReceiverId: careReceiverUuid, // UUID を初期値として設定
              careReceiverName,
              serviceId: serviceUuid || serviceId, // UUID を優先
              mainStaffId: staffOptions[0]?.value || null, // デフォルトで最初の職員をセット
              subStaffId: null,
              specialNotes: "",
              familyNotes: "",
              custom: {},
            }}
            staffOptions={staffOptions}
            allStaff={allStaff}
            templateFields={template.customFields || []}
            onSubmit={handleSubmit}
            onUpdateStaff={handleUpdateStaff}
            submitLabel={isSubmitting ? "保存中..." : "保存"}
            isSubmitting={isSubmitting}
            validationErrors={validationErrors}
          />
        )}
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
