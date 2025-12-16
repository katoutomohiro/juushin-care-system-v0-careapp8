import { NextResponse, type NextRequest } from "next/server"

/**
 * Offline Outbox からのケース記録 upsert を受け取り、サーバに保存
 * クライアント IndexedDB の outbox パターンをサポート
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { record } = body

    if (!record) {
      return NextResponse.json({ ok: false, error: "record is required" }, { status: 400 })
    }

    // TODO: 実際の保存ロジック
    // 例：supabase に case_records テーブルへ upsert
    // const result = await supabase.from('case_records').upsert(record).select().single()

    // 一旦、成功を返す（後で実装）
    console.log("[offline-upsert] Received case record:", record)

    return NextResponse.json({ ok: true, data: record }, { status: 200 })
  } catch (error) {
    console.error("[offline-upsert] Error", error)
    const message = error instanceof Error ? error.message : "Failed to upsert case record"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
