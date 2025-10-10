"use client"

import type React from "react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { type SeizureLog, SeizureLogSchema } from "@/schemas/seizure"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SmartSelect } from "./fields/SmartSelect"
import { useStopwatch } from "./hooks/useStopwatch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SeizureFormProps {
  onSubmit: (value: SeizureLog) => void
  onCancel?: () => void
  selectedUser?: string
  initial?: Partial<SeizureLog>
  readOnly?: boolean
  currentUserRole?: "staff" | "auditor"
}

export function SeizureForm({
  onSubmit,
  onCancel,
  selectedUser,
  initial,
  readOnly = false,
  currentUserRole = "staff",
}: SeizureFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SeizureLog>({
    resolver: zodResolver(SeizureLogSchema),
    defaultValues: {
      ...initial,
      userId: selectedUser || initial?.userId || "",
      occurredAt: initial?.occurredAt || new Date().toISOString(),
    },
  })

  const { running, seconds, start, stop, reset } = useStopwatch(watch("durationSec") || 0)

  const handleFormSubmit = (data: SeizureLog) => {
    onSubmit(data)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(handleFormSubmit)()
    }
  }

  const handleStopwatch = (action: "start" | "stop" | "reset") => {
    if (action === "start") {
      start()
    } else if (action === "stop") {
      stop()
      setValue("durationSec", seconds)
    } else {
      reset()
      setValue("durationSec", 0)
    }
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>発作記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} onKeyDown={handleKeyDown} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">利用者ID *</Label>
            <Input
              id="userId"
              {...register("userId")}
              readOnly={readOnly}
              className={errors.userId ? "border-red-500" : ""}
            />
            {errors.userId && (
              <div role="alert" className="text-red-500 text-sm">
                {errors.userId.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="occurredAt">発生時刻 *</Label>
            <Input
              id="occurredAt"
              type="datetime-local"
              {...register("occurredAt")}
              value={watch("occurredAt") ? format(new Date(watch("occurredAt")), "yyyy-MM-dd'T'HH:mm") : ""}
              onChange={(e) => setValue("occurredAt", new Date(e.target.value).toISOString())}
              readOnly={readOnly}
              className={errors.occurredAt ? "border-red-500" : ""}
            />
            {errors.occurredAt && (
              <div role="alert" className="text-red-500 text-sm">
                {errors.occurredAt.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seizureType">発作の種類 *</Label>
            <SmartSelect
              label="発作の種類 *"
              value={watch("seizureType")}
              onChange={(value) => setValue("seizureType", value as any)}
              placeholder="発作の種類を選択"
              disabled={readOnly}
              options={[
                { value: "強直間代", label: "強直間代" },
                { value: "ミオクロニー", label: "ミオクロニー" },
                { value: "ピク付き", label: "ピク付き" },
                { value: "上視線", label: "上視線" },
                { value: "不明", label: "不明" },
              ]}
            />
            {errors.seizureType && (
              <div role="alert" className="text-red-500 text-sm">
                {errors.seizureType.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationSec">持続時間（秒） *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="durationSec"
                type="number"
                min="0"
                max="36000"
                {...register("durationSec", { valueAsNumber: true })}
                readOnly={readOnly || running}
                disabled={running}
                className={errors.durationSec ? "border-red-500" : ""}
              />
              {!readOnly && (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={running ? "secondary" : "default"}
                    onClick={() => handleStopwatch("start")}
                    disabled={running}
                  >
                    開始
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStopwatch("stop")}
                    disabled={!running}
                  >
                    停止
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleStopwatch("reset")}>
                    リセット
                  </Button>
                  <span className="text-sm text-muted-foreground ml-2">{formatTime(seconds)}</span>
                </div>
              )}
            </div>
            {errors.durationSec && (
              <div role="alert" className="text-red-500 text-sm">
                {errors.durationSec.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">対応 *</Label>
            <SmartSelect
              label="対応 *"
              value={watch("response")}
              onChange={(value) => setValue("response", value as any)}
              placeholder="対応を選択"
              disabled={readOnly}
              options={[
                { value: "吸引", label: "吸引" },
                { value: "体位変換", label: "体位変換" },
                { value: "投薬", label: "投薬" },
                { value: "見守り", label: "見守り" },
              ]}
            />
            {errors.response && (
              <div role="alert" className="text-red-500 text-sm">
                {errors.response.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              maxLength={1000}
              readOnly={readOnly}
              className={errors.notes ? "border-red-500" : ""}
            />
            {errors.notes && (
              <div role="alert" className="text-red-500 text-sm">
                {errors.notes.message}
              </div>
            )}
          </div>

          {currentUserRole === "auditor" && (
            <div className="space-y-2">
              <Label htmlFor="reviewer">確認者</Label>
              <Input
                id="reviewer"
                {...register("reviewer")}
                readOnly={readOnly}
                className={errors.reviewer ? "border-red-500" : ""}
              />
              {errors.reviewer && (
                <div role="alert" className="text-red-500 text-sm">
                  {errors.reviewer.message}
                </div>
              )}
            </div>
          )}

          {!readOnly && (
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                記録を保存
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                  キャンセル
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
