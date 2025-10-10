"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataStorageService } from "@/services/data-storage-service"

interface DataBackupPanelProps {
  onDataChange?: () => void
}

export function DataBackupPanel({ onDataChange }: DataBackupPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportData = async () => {
    try {
      setIsExporting(true)
      setMessage(null)

      const data = DataStorageService.exportAllData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `care-app-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
      setMessage({ type: "success", text: "データのバックアップが完了しました" })
    } catch (error) {
      console.error("Export failed:", error)
      setMessage({ type: "error", text: "バックアップの作成に失敗しました" })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      setMessage(null)

      const text = await file.text()
      const success = DataStorageService.importAllData(text)

      if (success) {
        setMessage({ type: "success", text: "データの復元が完了しました" })
        onDataChange?.()
      } else {
        setMessage({ type: "error", text: "データの復元に失敗しました" })
      }
    } catch (error) {
      console.error("Import failed:", error)
      setMessage({ type: "error", text: "ファイルの読み込みに失敗しました" })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleClearData = () => {
    if (window.confirm("全てのデータを削除しますか？この操作は取り消せません。")) {
      try {
        DataStorageService.clearAllData()
        setMessage({ type: "success", text: "全てのデータを削除しました" })
        onDataChange?.()
      } catch (error) {
        console.error("Clear data failed:", error)
        setMessage({ type: "error", text: "データの削除に失敗しました" })
      }
    }
  }

  const storageInfo = DataStorageService.getStorageInfo()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📁 データ管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert className={message.type === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">データのバックアップ</Label>
            <p className="text-xs text-gray-600 mb-2">全ての記録データをJSONファイルとして保存します</p>
            <Button onClick={handleExportData} disabled={isExporting} className="w-full">
              {isExporting ? "エクスポート中..." : "📥 バックアップを作成"}
            </Button>
          </div>

          <div>
            <Label className="text-sm font-medium">データの復元</Label>
            <p className="text-xs text-gray-600 mb-2">バックアップファイルからデータを復元します</p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              disabled={isImporting}
              className="w-full"
            />
            {isImporting && <p className="text-xs text-blue-600 mt-1">インポート中...</p>}
          </div>

          <div className="border-t pt-3">
            <Label className="text-sm font-medium text-red-600">危険な操作</Label>
            <p className="text-xs text-gray-600 mb-2">全てのデータを完全に削除します</p>
            <Button onClick={handleClearData} variant="destructive" className="w-full">
              🗑️ 全データを削除
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <Label className="text-sm font-medium">ストレージ使用状況</Label>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>使用量: {Math.round(storageInfo.used / 1024)} KB</span>
              <span>{Math.round(storageInfo.percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
