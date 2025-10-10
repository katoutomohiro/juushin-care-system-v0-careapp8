"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export function AICareAssistant() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])

  const aiSuggestions = [
    "今日の体調変化から注意すべき点を教えて",
    "最適な活動プログラムを提案して",
    "家族への報告内容をまとめて",
    "緊急時の対応手順を確認したい",
  ]

  const careInsights = [
    {
      type: "健康管理",
      insight:
        "過去1週間のバイタルデータから、午後の体温上昇傾向が見られます。水分補給の頻度を増やすことをお勧めします。",
      priority: "中",
    },
    {
      type: "活動支援",
      insight: "創作活動への参加意欲が高まっています。新しい素材を使った活動を取り入れると良いでしょう。",
      priority: "低",
    },
    {
      type: "コミュニケーション",
      insight: "視線での意思表示が増えています。アイトラッキング支援機器の導入を検討してください。",
      priority: "高",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🤖 AI ケアアシスタント</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="ケアに関する質問や相談を入力してください..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((suggestion, index) => (
              <Button key={index} variant="outline" size="sm" onClick={() => setQuery(suggestion)} className="text-xs">
                {suggestion}
              </Button>
            ))}
          </div>
          <Button className="w-full">AI に相談する</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI による支援提案</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {careInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{insight.type}</Badge>
                  <Badge
                    variant={
                      insight.priority === "高" ? "destructive" : insight.priority === "中" ? "default" : "outline"
                    }
                  >
                    優先度: {insight.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
