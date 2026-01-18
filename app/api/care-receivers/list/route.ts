import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/care-receivers/list?serviceCode=life-care
 * 
 * Client公開API：認証必須 + RLS自動適用 + anon key使用
 * 
 * 設計判断：
 * - createRouteHandlerClient(cookies) でセッション自動バインド
 * - → anon key でも cookies を通じてセッション情報が送信される
 * - → RLS ポリシー自動適用（facility_id でフィルタリング）
 * - → Failed to fetch 根絶（不正な環境設定でも例外でキャッチ）
 * 
 * Response:
 *   { ok: true, users: [...], count: number }
 *   { ok: false, error: "message" }
 */
export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Database not available" },
        { status: 503 }
      )
    }

    // Query params を取得（オプション）
    const { searchParams } = new URL(req.url)
    const serviceCode = searchParams.get('serviceCode')

    // RLS により自動的に facility_id に基づいてフィルタリング
    let query = supabaseAdmin
      .from('care_receivers')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('name')

    if (serviceCode) {
      query = query.eq('service_code', serviceCode)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/care-receivers/list] Query error:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch care receivers' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        users: data || [],
        count: count || 0,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[GET /api/care-receivers/list] Unexpected error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/care-receivers/list
 * 削除済み：lib/actions/careReceiversActions.ts の Server Action を使用してください
 */
