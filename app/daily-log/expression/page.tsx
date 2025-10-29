"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InlineNowButton from "@/components/log/InlineNowButton";
import { DropdownField } from "@/components/log/DropdownField";
import { toDatetimeLocal } from "@/lib/datetime";
import { FACE_OPTIONS, RESPONSE_GOOD_FAIR_NONE, INTERVENTION_OPTIONS, AVERSIVE_SIGNS } from "@/config/options/expression";

export default function ExpressionReactionLogPage() {
  const [ts, setTs] = useState<string>(toDatetimeLocal());
  const [face, setFace] = useState<string>();
  const [sound, setSound] = useState<string>();
  const [touch, setTouch] = useState<string>();
  const [visual, setVisual] = useState<string>();
  const [namecall, setNamecall] = useState<string>();
  const [aversive, setAversive] = useState<string>();
  const [intervention, setIntervention] = useState<string>();
  const [note, setNote] = useState("");

  function handleSave() {
    const payload = { ts, face, sound, touch, visual, namecall, aversive, intervention, note };
    console.log("[expression-log] save request", payload);
    alert("一時保存しました（v1: コンソール出力）。v1.1で既存保存ロジックに接続します。");
  }

  const disabled = !ts || !face;

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">表情・反応記録</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                value={ts}
                onChange={(e) => setTs(e.target.value)}
              />
              <InlineNowButton setValue={setTs} />
            </div>
          </div>

          {/* 表情 */}
          <DropdownField label="表情" required value={face} onChange={setFace} options={FACE_OPTIONS} placeholder="状態を選択" />

          {/* 反応（聴覚・触覚・視覚・呼名） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DropdownField label="音への反応" value={sound} onChange={setSound} options={RESPONSE_GOOD_FAIR_NONE} />
            <DropdownField label="触覚への反応" value={touch} onChange={setTouch} options={RESPONSE_GOOD_FAIR_NONE} />
            <DropdownField label="視覚追視" value={visual} onChange={setVisual} options={RESPONSE_GOOD_FAIR_NONE} />
            <DropdownField label="呼名反応" value={namecall} onChange={setNamecall} options={RESPONSE_GOOD_FAIR_NONE} />
          </div>

          {/* 不快サイン・介入 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DropdownField label="嫌悪・不快のサイン" value={aversive} onChange={setAversive} options={AVERSIVE_SIGNS} />
            <DropdownField label="介入・対応" value={intervention} onChange={setIntervention} options={INTERVENTION_OPTIONS} />
          </div>

          {/* 備考 */}
          <div className="space-y-1.5">
            <Label className="text-sm">備考</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="自由記述" />
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleSave} disabled={disabled}>
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
