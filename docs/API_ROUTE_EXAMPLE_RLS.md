/**
 * API ルートテンプレーチE RLS 対忁E * 
 * こ�Eファイルは app/api/care-receivers/list/route.ts の参老E��裁E��す、E * 重要E RLS を前提とした実裁E��なってぁE��す、E */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * GET /api/care-receivers/list
 * 
 * Query params:
 *   - serviceCode: 'life-care' | 'after-school' (フィルタリング用)
 * 
 * RLS: 同一 facility_id のレコード�Eみ返す�E��E動！E * 
 * Response:
 *   { ok: true, users: [...], count: number }
 *   { ok: false, error: "message" }
 */
export async function GET(req: NextRequest) {
  try {
    // 1. 認証惁E��を確誁E    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. ログインユーザーの facility_id を取征E    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('[GET /api/care-receivers] Profile error:', profileError)
      return NextResponse.json(
        { ok: false, error: 'Profile not found' },
        { status: 403 }
      )
    }

    // 3. Query params を取得（オプション�E�E    const { searchParams } = new URL(req.url)
    const serviceCode = searchParams.get('serviceCode')

    // 4. RLS により、�E動的に自刁E�E facility のレコード�Eみ取征E    let query = supabase
      .from('care_receivers')
      .select('*')
      .eq('is_active', true)
      .order('name')

    // serviceCode フィルタリング�E�オプション�E�E    if (serviceCode) {
      query = query.eq('service_code', serviceCode)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/care-receivers] Query error:', error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      users: data || [],
      count: count || 0,
      facility_id: profile.facility_id, // 確認用
    })
  } catch (error) {
    console.error('[GET /api/care-receivers]', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/care-receivers/list
 * 
 * Body:
 *   { code, name, service_code, age?, gender?, ... }
 * 
 * RLS: facility_id は自動設定（偽裁E��止�E�E * 
 * Response:
 *   { ok: true, user: {...} }
 *   { ok: false, error: "message" }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 認証惁E��を確誁E    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. ログインユーザーの facility_id を取征E    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { ok: false, error: 'Profile not found' },
        { status: 403 }
      )
    }

    // 3. Request body をパース
    const body = await req.json()
    const { code, name, service_code, age, gender, care_level, condition, medical_care } = body

    // 4. バリチE�Eション
    if (!code || !name) {
      return NextResponse.json(
        { ok: false, error: 'code and name are required' },
        { status: 400 }
      )
    }

    // 5. INSERT�E�Eacility_id は強制�E�E    // RLS により、異なめEfacility_id での INSERT は拒否されめE    const { data, error } = await supabase
      .from('care_receivers')
      .insert({
        code,
        name,
        facility_id: profile.facility_id, // 重要E クライアント値を無視して強制設宁E        service_code,
        age: age ? parseInt(age) : null,
        gender,
        care_level: care_level ? parseInt(care_level) : null,
        condition,
        medical_care,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/care-receivers]', error)
      // RLS 拒否 = code が既孁Eor facility_id 不正
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: true, user: data },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/care-receivers]', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/care-receivers/[id]
 * 
 * Body: { name?, age?, gender?, ... }
 * 
 * RLS: 同一 facility_id のレコード�Eみ更新可
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id } = params

    // RLS により、�E刁E�E facility 以外�E UPDATE 拒否
    const { data, error } = await supabase
      .from('care_receivers')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/care-receivers]', error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, user: data })
  } catch (error) {
    console.error('[PUT /api/care-receivers]', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/care-receivers/[id]
 * 
 * RLS: 同一 facility_id のレコード�Eみ削除可
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // RLS により、�E刁E�E facility 以外�E DELETE 拒否
    const { error } = await supabase
      .from('care_receivers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE /api/care-receivers]', error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/care-receivers]', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

