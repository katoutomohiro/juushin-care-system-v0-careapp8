"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DailyLogPdfDoc } from "./daily-log-pdf-doc"

interface PdfPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  dailyLog: any
  careEvents: any[]
}

export function PdfPreviewModal({ isOpen, onClose, dailyLog, careEvents }: PdfPreviewModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const reportElement = document.getElementById("daily-log-report")
      if (reportElement) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>日常ケア記録レポート - ${dailyLog.user} (${dailyLog.date})</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  body { margin: 0; }
                  .print\\:shadow-none { box-shadow: none !important; }
                }
              </style>
            </head>
            <body>
              ${reportElement.outerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  if (!dailyLog) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            レポートプレビュー - {dailyLog.user} ({dailyLog.date})
            <div className="flex gap-2">
              <Button size="sm" onClick={handlePrint} className="flex items-center gap-2">
                🖨️ 印刷・PDF保存
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>日常ケア記録のプレビューと印刷・PDF保存機能</DialogDescription>
        </DialogHeader>

        <div className="flex-1 border border-border rounded-lg overflow-auto bg-gray-50 p-4">
          <div id="daily-log-report">
            <DailyLogPdfDoc dailyLog={dailyLog} careEvents={careEvents} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
