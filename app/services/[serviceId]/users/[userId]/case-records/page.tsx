"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CaseRecordsPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string
  const userId = decodeURIComponent(params.userId as string)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/services/${serviceId}/users/${encodeURIComponent(userId)}`)}
            >
              ← {userId}の詳細に戻る
            </Button>
            <div>
              <h1 className="text-2xl font-bold">ケース記録</h1>
              <p className="text-sm text-muted-foreground">{userId}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ケース記録</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">ケース記録機能は準備中です。</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
