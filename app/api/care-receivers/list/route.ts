import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/care-receivers/list?serviceCode=life-care
 * 
 * 本番環境対応版：認証必須 + RLS 自動適用 + エラーハンドリング強化
 * 
 * Response:
 *   { ok: true, users: [...], count: number }
 *   { ok: false, error: "message" }
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Supabase クライアント作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // 2. セッション確認 (Authorization ヘッダーから取得)
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      console.warn('[GET /api/care-receivers] No authorization header')
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 3. トークンを使用してユーザー情報を取得
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.warn('[GET /api/care-receivers] Invalid token')
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 4. staff_profiles から facility_id を取得
    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('[GET /api/care-receivers] Profile fetch error:', profileError)
      return NextResponse.json(
        { ok: false, error: 'Staff profile not found' },
        { status: 403 }
      )
    }

    // 5. Query params を取得（オプション）
    const { searchParams } = new URL(req.url)
    const serviceCode = searchParams.get('serviceCode')

    // 6. RLS により自動的に facility_id に基づいてフィルタリング
    let query = supabase
      .from('care_receivers')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('name')

    if (serviceCode) {
      query = query.eq('service_code', serviceCode)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/care-receivers] Query error:', error)
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
    console.error('[GET /api/care-receivers] Unexpected error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/care-receivers/list
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Supabase クライアント作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // 2. トークンを取得
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 3. ユーザー情報を取得
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 4. staff_profiles から facility_id を取得
    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { ok: false, error: 'Staff profile not found' },
        { status: 403 }
      )
    }

    // 5. Request body をパース + バリデーション
    const body = await req.json()
    const { code, name, service_code, age, gender, care_level, condition, medical_care } = body

    if (!code?.trim() || !name?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'code and name are required' },
        { status: 400 }
      )
    }

    // 6. INSERT（facility_id は強制設定）
    const { data, error } = await supabase
      .from('care_receivers')
      .insert({
        code: code.trim(),
        name: name.trim(),
        facility_id: profile.facility_id,
        service_code,
        age: age ? parseInt(age) : null,
        gender: gender?.trim(),
        care_level: care_level ? parseInt(care_level) : null,
        condition: condition?.trim(),
        medical_care: medical_care?.trim(),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/care-receivers] Insert error:', error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: true, user: data },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/care-receivers] Unexpected error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
