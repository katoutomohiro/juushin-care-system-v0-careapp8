"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { journalEntrySchema, type JournalEntry } from "@/schemas/journal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface JournalFormProps {
  onSubmit: (data: JournalEntry) => Promise<void>
  initialData?: Partial<JournalEntry>
}

export function JournalForm({ onSubmit, initialData }: JournalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JournalEntry>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: initialData || {
      title: "",
      content: "",
      category: "observation",
      tags: [],
    },
  })

  const category = watch("category")

  const handleFormSubmit = async (data: JournalEntry) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast.success("ジャーナルエントリーを保存しました")
    } catch (error) {
      toast.error("保存に失敗しました。もう一度お試しください。")
      console.error("[v0] Journal form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="ジャーナルエントリーのタイトル"
          aria-invalid={errors.title ? "true" : "false"}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-red-500" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">カテゴリー</Label>
        <Select value={category} onValueChange={(value) => setValue("category", value as JournalEntry["category"])}>
          <SelectTrigger id="category" aria-label="カテゴリーを選択">
            <SelectValue placeholder="カテゴリーを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="observation">観察</SelectItem>
            <SelectItem value="care">ケア</SelectItem>
            <SelectItem value="medical">医療</SelectItem>
            <SelectItem value="communication">コミュニケーション</SelectItem>
            <SelectItem value="other">その他</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500" role="alert">
            {errors.category.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">内容</Label>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="ジャーナルエントリーの内容を入力してください"
          rows={8}
          aria-invalid={errors.content ? "true" : "false"}
          aria-describedby={errors.content ? "content-error" : undefined}
        />
        {errors.content && (
          <p id="content-error" className="text-sm text-red-500" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "保存中..." : "保存"}
      </Button>
    </form>
  )
}
