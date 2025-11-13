"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toolbar } from "./Toolbar";

// ===== Inline Types =====
type ServiceType = "lifeCare" | "dayService" | "shortStay";

type DailyHeader = {
  date: string;
  service: ServiceType;
  nurseCareMin?: number;
};

type DailyAchievementRow = {
  userId?: string;
  userName: string;
  start?: string;
  end?: string;
  breakMin?: number;
  visitSupportMin?: number;
  late?: boolean;
  earlyLeave?: boolean;
  go?: boolean;
  back?: boolean;
  meal?: boolean;
  note?: string;
};

type DailySummary = {
  users: number;
  workMin: number;
  breakMin: number;
  nurseMin: number;
};

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  lifeCare: "生活介護",
  dayService: "デイサービス",
  shortStay: "ショートステイ",
};

// ===== Inline Schemas =====
const headerSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD形式で入力してください"),
  service: z.enum(["lifeCare", "dayService", "shortStay"]),
  nurseCareMin: z.number().min(0).optional(),
});

const rowSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().min(1),
  start: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM形式").optional(),
  end: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM形式").optional(),
  breakMin: z.number().min(0).optional(),
  visitSupportMin: z.number().min(0).optional(),
  late: z.boolean().optional(),
  earlyLeave: z.boolean().optional(),
  go: z.boolean().optional(),
  back: z.boolean().optional(),
  meal: z.boolean().optional(),
  note: z.string().optional(),
});

const rowsSchema = z.array(rowSchema);

// ===== Inline CSV Functions =====
function downloadCsv(header: DailyHeader, rows: DailyAchievementRow[], filename?: string) {
  const bom = "\ufeff";
  const nl = "\r\n";
  const headerLine = `date,service,nurseCareMin`;
  const dataLine = `${header.date},${header.service},${header.nurseCareMin ?? ""}`;
  
  const rowsHeader = "userId,userName,start,end,breakMin,visitSupportMin,late,earlyLeave,go,back,meal,note";
  const rowsData = rows.map(row =>
    [
      row.userId ?? "",
      row.userName ?? "",
      row.start ?? "",
      row.end ?? "",
      row.breakMin ?? "",
      row.visitSupportMin ?? "",
      row.late ? "1" : "0",
      row.earlyLeave ? "1" : "0",
      row.go ? "1" : "0",
      row.back ? "1" : "0",
      row.meal ? "1" : "0",
      row.note ?? "",
    ].join(",")
  ).join(nl);

  const csv = bom + headerLine + nl + dataLine + nl + nl + rowsHeader + nl + rowsData;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename ?? `achievements_${header.date}_${header.service}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function parseCsv(text: string): { okRows: DailyAchievementRow[]; errorRows: unknown[] } {
  const withoutBom = text.replace(/^\ufeff/, "");
  const lines = withoutBom.split(/\r?\n/).filter(line => line.trim());
  
  // Skip header lines (first 4 lines typically: header line, data line, blank, rows header)
  const dataLines = lines.slice(4);
  
  const okRows: DailyAchievementRow[] = [];
  const errorRows: unknown[] = [];

  dataLines.forEach((line) => {
    const fields = line.split(",");
    if (fields.length < 12) {
      errorRows.push({ line });
      return;
    }

    const rowData = {
      userId: fields[0] || undefined,
      userName: fields[1] || "",
      start: fields[2] || undefined,
      end: fields[3] || undefined,
      breakMin: fields[4] ? Number(fields[4]) : undefined,
      visitSupportMin: fields[5] ? Number(fields[5]) : undefined,
      late: fields[6] === "1",
      earlyLeave: fields[7] === "1",
      go: fields[8] === "1",
      back: fields[9] === "1",
      meal: fields[10] === "1",
      note: fields[11] || undefined,
    };

    const result = rowSchema.safeParse(rowData);
    if (result.success) {
      okRows.push(result.data);
    } else {
      errorRows.push({ line, error: result.error });
    }
  });

  return { okRows, errorRows };
}

// ===== Inline Components =====
function SummaryCards({ summary }: { summary: DailySummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">利用者数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.users}</div>
          <p className="text-xs text-muted-foreground">名</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">実働時間</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.workMin}</div>
          <p className="text-xs text-muted-foreground">分</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">休憩時間</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.breakMin}</div>
          <p className="text-xs text-muted-foreground">分</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">看護師看護</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.nurseMin}</div>
          <p className="text-xs text-muted-foreground">分</p>
        </CardContent>
      </Card>
    </div>
  );
}

function DailyAchievementTable({
  rows,
  errors,
  userSuggestions,
  onRowChange,
}: {
  rows: DailyAchievementRow[];
  errors: RowErrors[];
  userSuggestions: string[];
  onRowChange: (index: number, updates: Partial<DailyAchievementRow>) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-left">利用者名</th>
            <th className="p-2 text-left">開始</th>
            <th className="p-2 text-left">終了</th>
            <th className="p-2 text-left">休憩(分)</th>
            <th className="p-2 text-left">訪問支援(分)</th>
            <th className="p-2 text-center">遅刻</th>
            <th className="p-2 text-center">早退</th>
            <th className="p-2 text-center">行き</th>
            <th className="p-2 text-center">帰り</th>
            <th className="p-2 text-center">食事</th>
            <th className="p-2 text-left">備考</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b hover:bg-muted/30">
              <td className="p-2">
                <Input
                  list={`users-${i}`}
                  value={row.userName}
                  onChange={(e) => onRowChange(i, { userName: e.target.value })}
                  aria-invalid={!!errors[i]?.userName}
                />
                <datalist id={`users-${i}`}>
                  {userSuggestions.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
                {errors[i]?.userName && (
                  <p className="text-xs text-red-500 mt-1">{errors[i].userName}</p>
                )}
              </td>
              <td className="p-2">
                <Input
                  type="time"
                  value={row.start ?? ""}
                  onChange={(e) => onRowChange(i, { start: e.target.value || undefined })}
                  aria-invalid={!!errors[i]?.start}
                />
              </td>
              <td className="p-2">
                <Input
                  type="time"
                  value={row.end ?? ""}
                  onChange={(e) => onRowChange(i, { end: e.target.value || undefined })}
                  aria-invalid={!!errors[i]?.end}
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  min={0}
                  value={row.breakMin ?? ""}
                  onChange={(e) => onRowChange(i, { breakMin: e.target.value ? Number(e.target.value) : undefined })}
                  aria-invalid={!!errors[i]?.breakMin}
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  min={0}
                  value={row.visitSupportMin ?? ""}
                  onChange={(e) => onRowChange(i, { visitSupportMin: e.target.value ? Number(e.target.value) : undefined })}
                  aria-invalid={!!errors[i]?.visitSupportMin}
                />
              </td>
              <td className="p-2 text-center">
                <Label className="flex items-center justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.late ?? false}
                    onChange={(e) => onRowChange(i, { late: e.target.checked })}
                    className="w-4 h-4"
                    aria-label="遅刻"
                  />
                  <span className="sr-only">遅刻</span>
                </Label>
              </td>
              <td className="p-2 text-center">
                <Label className="flex items-center justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.earlyLeave ?? false}
                    onChange={(e) => onRowChange(i, { earlyLeave: e.target.checked })}
                    className="w-4 h-4"
                    aria-label="早退"
                  />
                  <span className="sr-only">早退</span>
                </Label>
              </td>
              <td className="p-2 text-center">
                <Label className="flex items-center justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.go ?? false}
                    onChange={(e) => onRowChange(i, { go: e.target.checked })}
                    className="w-4 h-4"
                    aria-label="行き"
                  />
                  <span className="sr-only">行き</span>
                </Label>
              </td>
              <td className="p-2 text-center">
                <Label className="flex items-center justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.back ?? false}
                    onChange={(e) => onRowChange(i, { back: e.target.checked })}
                    className="w-4 h-4"
                    aria-label="帰り"
                  />
                  <span className="sr-only">帰り</span>
                </Label>
              </td>
              <td className="p-2 text-center">
                <Label className="flex items-center justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.meal ?? false}
                    onChange={(e) => onRowChange(i, { meal: e.target.checked })}
                    className="w-4 h-4"
                    aria-label="食事"
                  />
                  <span className="sr-only">食事</span>
                </Label>
              </td>
              <td className="p-2">
                <Input
                  value={row.note ?? ""}
                  onChange={(e) => onRowChange(i, { note: e.target.value || undefined })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


type RowErrors = Partial<Record<keyof DailyAchievementRow, string>>;
type HeaderErrors = Partial<Record<keyof DailyHeader, string>>;

const DEFAULT_ROWS: DailyAchievementRow[] = [
  {
    userId: "user-1",
    userName: "テスト 太郎",
    start: "10:00",
    end: "15:00",
    breakMin: 60,
    visitSupportMin: 30,
    late: false,
    earlyLeave: false,
    go: true,
    back: false,
    meal: true,
    note: "体調良好",
  },
  {
    userId: "user-2",
    userName: "サンプル 花子",
    start: "09:30",
    end: "16:00",
    breakMin: 45,
    visitSupportMin: 0,
    late: false,
    earlyLeave: true,
    go: false,
    back: true,
    meal: false,
    note: "",
  },
];

const DEFAULT_HEADER: DailyHeader = {
  date: new Date().toISOString().slice(0, 10),
  service: "lifeCare",
  nurseCareMin: 30,
};

const DEFAULT_USER_SUGGESTIONS = [
  "テスト 太郎",
  "サンプル 花子",
  "山田 太郎",
  "山田 花子",
  "佐藤 次郎",
] as const;

// TODO: Replace with real user data from a shared Users service/module
// Example: import { useUsers } from "@/features/users/hooks";
// const { users } = useUsers(); // returns [{ id: string, name: string }, ...]
// Then merge with existing row data for suggestions

function minutesBetween(start?: string, end?: string): number | undefined {
  if (!start || !end) return undefined;
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMin) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMin)
  ) {
    return undefined;
  }
  return endHour * 60 + endMin - (startHour * 60 + startMin);
}

function computeSummary(header: DailyHeader, rows: DailyAchievementRow[]): DailySummary {
  const distinctUsers = new Set(
    rows
      .map((row) =>
        row.userId ? row.userId : row.userName.trim() ? `${row.userName.trim()}` : undefined,
      )
      .filter(Boolean),
  );

  let workMin = 0;
  let breakMin = 0;
  let visitMin = 0;

  rows.forEach((row) => {
    const diff = minutesBetween(row.start, row.end);
    const rest = row.breakMin ?? 0;
    if (diff !== undefined) {
      workMin += Math.max(0, diff - rest);
    }
    breakMin += rest;
    visitMin += row.visitSupportMin ?? 0;
  });

  return {
    users: distinctUsers.size,
    workMin,
    breakMin,
    nurseMin: header.nurseCareMin ?? visitMin,
  };
}

function extractHeaderErrors(schemaResult: ReturnType<typeof headerSchema.safeParse>): HeaderErrors {
  if (schemaResult.success) {
    return {};
  }
  const flattened = schemaResult.error.flatten().fieldErrors;
  return {
    date: flattened.date?.[0],
    service: flattened.service?.[0],
    nurseCareMin: flattened.nurseCareMin?.[0],
  };
}

function extractRowErrors(length: number, schemaResult: ReturnType<typeof rowsSchema.safeParse>): RowErrors[] {
  if (schemaResult.success) {
    return Array.from({ length }, () => ({}));
  }

  const next = Array.from({ length }, () => ({} as RowErrors));
  schemaResult.error.issues.forEach((issue) => {
    const [rowIndex, field] = issue.path;
    if (
      typeof rowIndex === "number" &&
      typeof field === "string" &&
      rowIndex < length &&
      !next[rowIndex][field as keyof DailyAchievementRow]
    ) {
      next[rowIndex][field as keyof DailyAchievementRow] = issue.message;
    }
  });
  return next;
}

export default function DailyAchievementClient() {
  const [header, setHeader] = useState<DailyHeader>(DEFAULT_HEADER);
  const [rows, setRows] = useState<DailyAchievementRow[]>(DEFAULT_ROWS);
  const [headerErrors, setHeaderErrors] = useState<HeaderErrors>({});
  const [rowErrors, setRowErrors] = useState<RowErrors[]>(() => DEFAULT_ROWS.map(() => ({})));
  const [isHydrated, setIsHydrated] = useState(false);
  const [importErrorCount, setImportErrorCount] = useState<number>(0);

  const storageKey = useMemo(
    () => `draft:achievements:${header.date}:${header.service}`,
    [header.date, header.service],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setIsHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as {
        header?: Partial<DailyHeader>;
        rows?: DailyAchievementRow[];
      };
      if (parsed.header && typeof parsed.header.nurseCareMin === "number") {
        setHeader((prev) => ({
          ...prev,
          nurseCareMin: parsed.header?.nurseCareMin ?? prev.nurseCareMin,
        }));
      }
      if (Array.isArray(parsed.rows)) {
        setRows(parsed.rows.map((row) => ({ ...row })) as DailyAchievementRow[]);
      }
    } catch (error) {
      console.warn("draft load failed", error);
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);

  // debounced draft save (500ms)
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    const timeout = setTimeout(() => {
      try {
        const payload = JSON.stringify({ header, rows });
        localStorage.setItem(storageKey, payload);
      } catch (error) {
        console.warn("draft save failed", error);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [header, rows, storageKey, isHydrated]);

  useEffect(() => {
    const headerResult = headerSchema.safeParse(header);
    setHeaderErrors(extractHeaderErrors(headerResult));
  }, [header]);

  useEffect(() => {
    const rowsResult = rowsSchema.safeParse(rows);
    setRowErrors(extractRowErrors(rows.length, rowsResult));
  }, [rows]);

  const validRowsForSummary = useMemo(() => {
    return rows.filter((_, index) => {
      const rowError = rowErrors[index];
      return !rowError || Object.values(rowError).every((message) => !message);
    });
  }, [rows, rowErrors]);

  const summary = useMemo(() => computeSummary(header, validRowsForSummary), [header, validRowsForSummary]);

  const handleHeaderChange = useCallback((updates: Partial<DailyHeader>) => {
    setHeader((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleRowChange = useCallback((index: number, updates: Partial<DailyAchievementRow>) => {
    setRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...updates } : row)),
    );
  }, []);

  const handleDownload = useCallback(() => {
    const headerResult = headerSchema.safeParse(header);
    const rowsResult = rowsSchema.safeParse(rows);
    const nextHeaderErrors = extractHeaderErrors(headerResult);
    const nextRowErrors = extractRowErrors(rows.length, rowsResult);

    setHeaderErrors(nextHeaderErrors);
    setRowErrors(nextRowErrors);

    const hasHeaderError = Object.values(nextHeaderErrors).some((message) => Boolean(message));
    const hasRowError = nextRowErrors.some((error) => Object.values(error).some(Boolean));
    if (hasHeaderError || hasRowError || !headerResult.success || !rowsResult.success) {
      return;
    }

    downloadCsv(headerResult.data, rowsResult.data);
  }, [header, rows]);

  const handleImportFromCsv = useCallback((text: string) => {
    const { okRows, errorRows } = parseCsv(text);
    // 上書き読込: ヘッダーは現状維持、行のみ差し替え
    setRows(okRows);
    setImportErrorCount(errorRows?.length ?? 0);
  }, []);

  const handleResetDraft = useCallback(() => {
    if (!confirm("下書きをリセットしますか？ ローカルに保存されたデータは削除され、初期値に戻ります。")) {
      return;
    }
    try {
      localStorage.removeItem(storageKey);
      setHeader(DEFAULT_HEADER);
      setRows(DEFAULT_ROWS);
      setHeaderErrors({});
      setRowErrors(DEFAULT_ROWS.map(() => ({})));
    } catch (error) {
      console.warn("draft reset failed", error);
    }
  }, [storageKey]);

  const userSuggestions = useMemo(() => {
    const suggestions = new Set<string>(DEFAULT_USER_SUGGESTIONS);
    rows.forEach((row) => {
      if (row.userName?.trim()) {
        suggestions.add(row.userName.trim());
      }
    });
    return Array.from(suggestions).sort((a, b) => a.localeCompare(b, "ja"));
  }, [rows]);

  return (
    <main className="container mx-auto space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">実績管理（日別）</h1>
        <p className="text-sm text-muted-foreground">
          サービス: {SERVICE_TYPE_LABELS[header.service]} / 日付: {header.date}
        </p>
      </header>

      <Toolbar
        header={header}
        errors={headerErrors}
        onHeaderChange={handleHeaderChange}
        onDownloadCsv={handleDownload}
        onImportFromCsv={handleImportFromCsv}
        importErrorCount={importErrorCount}
        onResetDraft={handleResetDraft}
      />

      <SummaryCards summary={summary} />

      <DailyAchievementTable
        rows={rows}
        errors={rowErrors}
        userSuggestions={userSuggestions}
        onRowChange={handleRowChange}
      />
    </main>
  );
}
