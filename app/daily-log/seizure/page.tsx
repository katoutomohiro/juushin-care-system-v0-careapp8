"use client"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import InlineNowButton from "@/components/log/InlineNowButton"
import { DropdownField } from "@/components/log/DropdownField"
import { toDatetimeLocal } from "@/lib/datetime"
import { SEIZURE_TYPES, TRIGGERS, INTERVENTION_OPTIONS } from "@/config/options/seizure"
import { saveSeizureLog } from "@/lib/persistence/seizure"
import { insertSeizureToPublic } from "@/lib/seizures"
import { toast } from "sonner"

function SeizureForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("serviceId")
  const userId = searchParams.get("userId")

  const [occurredAt, setOccurredAt] = useState<string>(toDatetimeLocal())
  const [seizureType, setSeizureType] = useState<string>("")
  const [duration, setDuration] = useState<string>("")
  const [trigger, setTrigger] = useState<string>("")
  const [intervention, setIntervention] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ occurredAt?: string; seizureType?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { occurredAt?: string; seizureType?: string } = {}
    if (!occurredAt) newErrors.occurredAt = "記録時刻は必須です"
    if (!seizureType) newErrors.seizureType = "発作種別は必須です"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await saveSeizureLog({
        occurredAt,
        seizureType,
        duration: duration ? Number(duration) : null,
        trigger: trigger || null,
        intervention: intervention || null,
        note: note || null,
        serviceId: serviceId || null,
        userId: userId || null,
      })
      // 付加処理: public.seizures にも追記（失敗してもフォーム保存は成功扱い）
      try {
        // reporter_id を取得（未ログイン時は null → ヘルパー側でダミーUUID化）
        const { supabase } = await import("@/lib/supabase/browsers")
        const { data: auth } = await supabase.auth.getUser()
        const reporterId = auth.user?.id ?? null

        const result = await insertSeizureToPublic({
          episode_at: new Date(occurredAt).toISOString(),
          type: seizureType || "不明",
          duration_seconds: duration ? Number(duration) : null,
          triggers: trigger ? [trigger] : [],
          interventions: intervention ? [intervention] : [],
          note: note || null,
          user_id: userId,
          reporter_id: reporterId,
        })
        if (!result.ok) {
          console.error("[daily-log → seizures] insert failed:", result.error)
        }
      } catch (err) {
        console.error("[daily-log → seizures] unexpected error:", err)
      }
      try { toast.success("保存しました") } catch { alert("保存しました") }
      router.push("/daily-log")
    } catch (error) {
      console.error("[seizure-log] save error:", error)
      try { toast.error("保存に失敗しました") } catch { alert("保存に失敗しました") }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-2 flex items-center justify-between">
          <CardTitle className="text-xl">発作記録</CardTitle>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><a href="/daily-log/seizure/history">履歴</a></Button>
            <Button asChild variant="outline" size="sm"><a href="/daily-log">一覧に戻る</a></Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 記録時刻 + 今すぐ */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm" htmlFor="seizure-ts">
                  記録時刻<span className="text-red-500 ml-1">*</span>
                </Label>
              </div>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  id="seizure-ts"
                  aria-label="記録時刻"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                />
                <InlineNowButton setValue={setOccurredAt} />
              </div>
              {errors.occurredAt && <p className="text-sm text-red-500">{errors.occurredAt}</p>}
            </div>

            {/* 発作種別 */}
            <div className="space-y-1.5">
              <DropdownField
                label="発作種別"
                required
                value={seizureType}
                onChange={setSeizureType}
                options={SEIZURE_TYPES}
                placeholder="選択"
              />
              {errors.seizureType && <p className="text-sm text-red-500">{errors.seizureType}</p>}
            </div>

            {/* 持続時間（秒） */}
            <div className="space-y-1.5">
              <Label className="text-sm">持続時間（秒）</Label>
              <input
                type="number"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="例: 45"
                min={0}
              />
            </div>

            {/* 誘因・介入 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropdownField label="誘因候補" value={trigger} onChange={setTrigger} options={TRIGGERS} />
              <DropdownField label="介入・対応" value={intervention} onChange={setIntervention} options={INTERVENTION_OPTIONS} />
            </div>

            {/* 備考 */}
            <div className="space-y-1.5">
              <Label className="text-sm">備考</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="自由記述" />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/daily-log")}>キャンセル</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "保存中..." : "保存"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SeizureLogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">読み込み中...</div>}>
      <SeizureForm />
    </Suspense>
  )
}
