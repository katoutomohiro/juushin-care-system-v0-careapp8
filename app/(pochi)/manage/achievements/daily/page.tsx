"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { SafeParseSuccess } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { headerSchema, rowSchema, draftSchema, type DailyHeaderForm, type DailyRowForm } from "./schema"
import { toCsv } from "./csv"
import { UserNameInput } from "./user-name-input"
import { cn } from "@/lib/utils"

const DEFAULT_HEADER: DailyHeaderForm = {
  service: "",
  date: "",
  nurseMinutes: "",
}

const AVAILABLE_SERVICES = [
  { label: "児童発達支援", value: "child-development" },
  { label: "放課後等デイサービス", value: "after-school" },
  { label: "日中一時支援", value: "daytime-support" },
]

const USER_SUGGESTIONS = ["田中太郎", "山田花子", "佐藤健", "伊藤蓮"]

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const createEmptyRow = (): DailyRowForm => ({
  id: generateId(),
  userName: "",
  plannedCare: "",
  achievedDescription: "",
  achieved: false,
  hasAlert: false,
  notes: "",
})

const getStorageKey = (header: DailyHeaderForm) =>
  header.service && header.date ? `draft:achievements:${header.date}:${header.service}` : undefined

const STORAGE_SCHEMA = draftSchema

export default function DailyAchievementsPage() {
  const [header, setHeader] = useState<DailyHeaderForm>(DEFAULT_HEADER)
  const [rows, setRows] = useState<DailyRowForm[]>([createEmptyRow()])
  const [includeAlerts, setIncludeAlerts] = useState(false)
  const storageKey = useMemo(() => getStorageKey(header), [header.date, header.service])
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    if (!storageKey) {
      setLoadedStorageKey(undefined)
      return
    }
    if (loadedStorageKey === storageKey) {
      return
    }
    const storedValue = window.localStorage.getItem(storageKey)
    if (storedValue) {
      try {
        const parsed = JSON.parse(storedValue)
        const result = STORAGE_SCHEMA.safeParse(parsed)
        if (result.success) {
          setHeader(result.data.header)
          setRows(result.data.rows.map((row) => ({ ...row, id: row.id || generateId() })))
        }
      } catch (error) {
        console.error("Failed to parse draft achievements", error)
      }
    }
    setLoadedStorageKey(storageKey)
  }, [storageKey, loadedStorageKey])

  useEffect(() => {
    if (typeof window === "undefined" || !storageKey || loadedStorageKey !== storageKey) {
      return
    }
    if (!header.service || !header.date) {
      return
    }
    const draft = { header, rows }
    window.localStorage.setItem(storageKey, JSON.stringify(draft))
  }, [header, rows, storageKey, loadedStorageKey])

  const headerValidation = useMemo(() => headerSchema.safeParse(header), [header])
  const headerErrors: Partial<Record<keyof DailyHeaderForm, string[]>> = headerValidation.success
    ? {}
    : headerValidation.error.formErrors.fieldErrors
  const rowValidations = useMemo(() => rows.map((row) => rowSchema.safeParse(row)), [rows])
  const isFormValid = headerValidation.success && rowValidations.every((result) => result.success)

  const summary = useMemo(() => {
    const totalUsers = rows.length
    const achievedCount = rows.filter((row) => row.achieved).length
    const alertCount = rows.filter((row) => row.hasAlert).length
    const nurseMinutes = Number.parseInt(header.nurseMinutes, 10)
    return {
      totalUsers,
      achievedCount,
      pendingCount: Math.max(totalUsers - achievedCount, 0),
      alertCount,
      nurseMinutes: Number.isNaN(nurseMinutes) ? 0 : nurseMinutes,
    }
  }, [rows, header.nurseMinutes])

  const handleHeaderChange = useCallback(
    (field: keyof DailyHeaderForm, value: DailyHeaderForm[keyof DailyHeaderForm]) => {
      setHeader((current) => ({ ...current, [field]: value }))
    },
    [],
  )

  const handleRowChange = useCallback(
    (rowId: string, field: keyof DailyRowForm, value: DailyRowForm[keyof DailyRowForm]) => {
      setRows((current) => current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)))
    },
    [],
  )

  const addRow = useCallback(() => {
    setRows((current) => [...current, createEmptyRow()])
  }, [])

  const removeRow = useCallback((rowId: string) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== rowId) : current))
  }, [])

  const downloadCsv = useCallback(() => {
    const headerResult = headerSchema.safeParse(header)
    const rowResults = rows.map((row) => rowSchema.safeParse(row))
    if (!headerResult.success || rowResults.some((result) => !result.success)) {
      return
    }
    const validRows = rowResults.map((result) => (result as SafeParseSuccess<DailyRowForm>).data)
    const csv = toCsv(headerResult.data, validRows, { includeAlerts })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const formattedDate = headerResult.data.date.replace(/-/g, "")
    link.href = url
    link.download = `daily-achievements-${formattedDate || "draft"}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [header, rows, includeAlerts])

  const featureEnabled = process.env.NEXT_PUBLIC_FEATURE_POCHI_RESULTS !== "false"

  if (!featureEnabled) {
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>日次実績管理</CardTitle>
            <CardDescription>この機能は現在無効化されています。</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">日次実績サマリー</h1>
          <p className="text-sm text-muted-foreground">サービス別の利用者実績と看護時間を記録します。</p>
        </div>
        <section aria-labelledby="daily-header" className="grid gap-6 rounded-md border p-4">
          <h2 id="daily-header" className="text-lg font-medium">
            サービス情報
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="daily-service">サービス</Label>
              <Select
                value={header.service}
                onValueChange={(value) => handleHeaderChange("service", value)}
              >
                <SelectTrigger
                  id="daily-service"
                  aria-describedby={headerErrors.service?.[0] ? "daily-service-error" : undefined}
                >
                  <SelectValue placeholder="サービスを選択" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_SERVICES.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {headerErrors.service?.[0] && (
                <p id="daily-service-error" className="text-sm text-destructive">
                  {headerErrors.service[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="daily-date">日付</Label>
              <Input
                id="daily-date"
                type="date"
                value={header.date}
                onChange={(event) => handleHeaderChange("date", event.target.value)}
                aria-describedby={headerErrors.date?.[0] ? "daily-date-error" : undefined}
              />
              {headerErrors.date?.[0] && (
                <p id="daily-date-error" className="text-sm text-destructive">
                  {headerErrors.date[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="daily-nurse-minutes">看護師看護時間(分)</Label>
              <Input
                id="daily-nurse-minutes"
                inputMode="numeric"
                value={header.nurseMinutes}
                onChange={(event) => handleHeaderChange("nurseMinutes", event.target.value)}
                aria-describedby={headerErrors.nurseMinutes?.[0] ? "daily-nurse-minutes-error" : undefined}
              />
              {headerErrors.nurseMinutes?.[0] && (
                <p id="daily-nurse-minutes-error" className="text-sm text-destructive">
                  {headerErrors.nurseMinutes[0]}
                </p>
              )}
            </div>
          </div>
        </section>
      </header>

      <section aria-labelledby="summary-cards" className="grid gap-4 md:grid-cols-4">
        <h2 id="summary-cards" className="sr-only">
          サマリー
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>利用者数</CardTitle>
            <CardDescription>登録済みの利用者</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.totalUsers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>達成済み</CardTitle>
            <CardDescription>実績が完了した利用者</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-600">
            {summary.achievedCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>未完了</CardTitle>
            <CardDescription>実績が未完了の利用者</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-500">
            {summary.pendingCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>看護時間(分)</CardTitle>
            <CardDescription>入力した看護時間合計</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-sky-600">
            {summary.nurseMinutes}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="achievements-table" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="achievements-table" className="text-lg font-medium">
              利用者別実績
            </h2>
            <p className="text-sm text-muted-foreground">利用者ごとの予定と実績、アラートを記録します。</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-alerts"
              checked={includeAlerts}
              onCheckedChange={(checked) => setIncludeAlerts(checked === true)}
            />
            <Label htmlFor="include-alerts" className="cursor-pointer">
              アラート行をCSVに含める
            </Label>
            <Button variant="outline" onClick={addRow}>
              行を追加
            </Button>
            <Button onClick={downloadCsv} disabled={!isFormValid}>
              CSVを出力
            </Button>
          </div>
        </div>

        {!isFormValid && (
          <p className="text-sm text-muted-foreground" role="status">
            入力内容に不足があります。すべてのフィールドを確認するとCSVを出力できます。
          </p>
        )}

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">利用者名</TableHead>
                <TableHead className="min-w-[200px]">予定ケア</TableHead>
                <TableHead className="min-w-[200px]">実績内容</TableHead>
                <TableHead className="min-w-[120px]">達成</TableHead>
                <TableHead className="min-w-[120px]">アラート</TableHead>
                <TableHead className="min-w-[240px]">メモ</TableHead>
                <TableHead className="min-w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => {
                const validation = rowValidations[index]
                const fieldErrors = validation.success ? {} : validation.error.formErrors.fieldErrors
                const achievedId = `row-${index}-achieved`
                const alertId = `row-${index}-alert`
                const nameId = `row-${index}-name`
                return (
                  <TableRow key={row.id} className={cn(row.hasAlert && "bg-amber-50")}> 
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={nameId} className="sr-only">
                          利用者名
                        </Label>
                        <UserNameInput
                          id={nameId}
                          value={row.userName}
                          onChange={(value) => handleRowChange(row.id, "userName", value)}
                          suggestions={USER_SUGGESTIONS}
                          placeholder="利用者名"
                        />
                        {fieldErrors.userName?.[0] && (
                          <p className="text-sm text-destructive">{fieldErrors.userName[0]}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`row-${index}-planned`} className="sr-only">
                          予定ケア
                        </Label>
                        <Input
                          id={`row-${index}-planned`}
                          value={row.plannedCare}
                          onChange={(event) => handleRowChange(row.id, "plannedCare", event.target.value)}
                        />
                        {fieldErrors.plannedCare?.[0] && (
                          <p className="text-sm text-destructive">{fieldErrors.plannedCare[0]}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`row-${index}-achieved-description`} className="sr-only">
                          実績内容
                        </Label>
                        <Textarea
                          id={`row-${index}-achieved-description`}
                          value={row.achievedDescription}
                          onChange={(event) => handleRowChange(row.id, "achievedDescription", event.target.value)}
                        />
                        {fieldErrors.achievedDescription?.[0] && (
                          <p className="text-sm text-destructive">{fieldErrors.achievedDescription[0]}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={achievedId}
                          checked={row.achieved}
                          onCheckedChange={(checked) =>
                            handleRowChange(row.id, "achieved", checked === true)
                          }
                        />
                        <Label htmlFor={achievedId} className="cursor-pointer">
                          達成
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={alertId}
                          checked={row.hasAlert}
                          onCheckedChange={(checked) =>
                            handleRowChange(row.id, "hasAlert", checked === true)
                          }
                        />
                        <Label htmlFor={alertId} className="cursor-pointer">
                          アラート
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`row-${index}-notes`} className="sr-only">
                          メモ
                        </Label>
                        <Textarea
                          id={`row-${index}-notes`}
                          value={row.notes ?? ""}
                          onChange={(event) => handleRowChange(row.id, "notes", event.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" onClick={() => removeRow(row.id)}>
                        削除
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  )
}
