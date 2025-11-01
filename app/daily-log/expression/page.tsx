"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InlineNowButton from "@/components/log/InlineNowButton";
import { DropdownField } from "@/components/log/DropdownField";
import { toDatetimeLocal } from "@/lib/datetime";
import { FACE_OPTIONS, RESPONSE_GOOD_FAIR_NONE, INTERVENTION_OPTIONS, AVERSIVE_SIGNS } from "@/config/options/expression";
import { saveExpressionLog } from "@/lib/persistence/expression";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

function ExpressionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const userId = searchParams.get("userId");

  const [occurredAt, setOccurredAt] = useState<string>(toDatetimeLocal());
  const [expression, setExpression] = useState<string>("");
  const [reaction, setReaction] = useState<string>("");
  const [intervention, setIntervention] = useState<string>("");
  const [discomfort, setDiscomfort] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ occurredAt?: string; expression?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { occurredAt?: string; expression?: string } = {};
    if (!occurredAt) {
      newErrors.occurredAt = "記録時刻は必須です";
    }
    if (!expression) {
      newErrors.expression = "表情は必須です";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await saveExpressionLog({
        occurredAt,
        expression,
        reaction: reaction || null,
        intervention: intervention || null,
        discomfort: discomfort || null,
        note: note || null,
        serviceId: serviceId || null,
        userId: userId || null,
      });

      // Try toast, fallback to alert
      try {
        toast.success("保存しました");
      } catch {
        alert("保存しました");
      }

      router.push("/daily-log");
    } catch (error) {
      console.error("[expression-log] save error:", error);
      try {
        toast.error("保存に失敗しました");
      } catch {
        alert("保存に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-2 flex items-center justify-between">
          <CardTitle className="text-xl">表情・反応記録</CardTitle>
          <Button asChild variant="outline" size="sm">
            <a href="/daily-log/expression/history">履歴を見る</a>
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 記録時刻 + 今すぐ */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm" htmlFor="expression-ts">
                  記録時刻<span className="text-red-500 ml-1">*</span>
                </Label>
              </div>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  id="expression-ts"
                  aria-label="記録時刻"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                />
                <InlineNowButton setValue={setOccurredAt} />
              </div>
              {errors.occurredAt && (
                <p className="text-sm text-red-500">{errors.occurredAt}</p>
              )}
            </div>

            {/* 表情 */}
            <div className="space-y-1.5">
              <DropdownField
                label="表情"
                required
                value={expression}
                onChange={setExpression}
                options={FACE_OPTIONS}
                placeholder="状態を選択"
              />
              {errors.expression && (
                <p className="text-sm text-red-500">{errors.expression}</p>
              )}
            </div>

            {/* 反応（聴覚・触覚・視覚・呼名） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropdownField
                label="音への反応"
                value={reaction}
                onChange={setReaction}
                options={RESPONSE_GOOD_FAIR_NONE}
              />
              <DropdownField
                label="触覚への反応"
                value={reaction}
                onChange={setReaction}
                options={RESPONSE_GOOD_FAIR_NONE}
              />
              <DropdownField
                label="視覚追視"
                value={reaction}
                onChange={setReaction}
                options={RESPONSE_GOOD_FAIR_NONE}
              />
              <DropdownField
                label="呼名反応"
                value={reaction}
                onChange={setReaction}
                options={RESPONSE_GOOD_FAIR_NONE}
              />
            </div>

            {/* 不快サイン・介入 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropdownField
                label="嫌悪・不快のサイン"
                value={discomfort}
                onChange={setDiscomfort}
                options={AVERSIVE_SIGNS}
              />
              <DropdownField
                label="介入・対応"
                value={intervention}
                onChange={setIntervention}
                options={INTERVENTION_OPTIONS}
              />
            </div>

            {/* 備考 */}
            <div className="space-y-1.5">
              <Label className="text-sm">備考</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="自由記述"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/daily-log")}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExpressionReactionLogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">読み込み中...</div>}>
      <ExpressionForm />
    </Suspense>
  );
}
