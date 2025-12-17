"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";

type DailyHeader = {
  date: string;
  service: "lifeCare" | "dayService" | "shortStay";
  nurseCareMin?: number;
};

type HeaderErrors = Partial<Record<keyof DailyHeader, string>>;

type ToolbarProps = {
  header: DailyHeader;
  errors: HeaderErrors;
  onHeaderChange: (updates: Partial<DailyHeader>) => void;
  onDownloadCsv: () => void;
  onImportFromCsv: (text: string) => void;
  importErrorCount: number;
  onResetDraft: () => void;
};

export function Toolbar({
  header,
  errors,
  onHeaderChange,
  onDownloadCsv,
  onImportFromCsv,
  importErrorCount,
  onResetDraft,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        onImportFromCsv(text);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              type="date"
              value={header.date ?? ""}
              onChange={(e) => onHeaderChange({ date: e.currentTarget.value })}
              aria-invalid={!!errors.date}
            />
          {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="nurseCareMin">看護師看護時間（分）</Label>
          <Input
            id="nurseCareMin"
            type="number"
            min={0}
            value={header.nurseCareMin ?? ""}
            onChange={(e) => {
              const value = e.target.value === "" ? undefined : Number(e.target.value);
              onHeaderChange({ nurseCareMin: value });
            }}
            aria-invalid={!!errors.nurseCareMin}
          />
          {errors.nurseCareMin && (
            <p className="text-sm text-red-500 mt-1">{errors.nurseCareMin}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onDownloadCsv} variant="default">
          CSV出力
        </Button>

        <Button onClick={handleImportClick} variant="outline" className="relative">
          CSV取込（上書き）
          {importErrorCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {importErrorCount}
            </Badge>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          aria-hidden="true"
          tabIndex={-1}
          title="CSV file input"
          className="hidden"
        />

        <Button onClick={onResetDraft} variant="ghost">
          下書きリセット
        </Button>
      </div>
    </div>
  );
}
