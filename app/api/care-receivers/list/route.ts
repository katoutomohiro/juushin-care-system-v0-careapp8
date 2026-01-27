import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/care-receivers/list?serviceCode=life-care
 * 
 * Response:
 *   { ok: true, users: [...], count: number, serviceCode: string }
 *   { ok: false, users: [], count: 0, error: string, serviceCode: string }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const serviceCode = searchParams.get('serviceCode') ?? ''

  console.log('[API] GET /care-receivers/list - serviceCode:', serviceCode)

  try {
    if (!supabaseAdmin) {
      console.error('[API] supabaseAdmin is null')
      return NextResponse.json(
        {
          ok: false,
          serviceCode,
          users: [],
          count: 0,
          error: 'Database not available'
        },
        { status: 503 }
      )
    }

    // 診断用：絞り込みなしで全件取得してservice_codeを確認
    const { data: allData, error: allError } = await supabaseAdmin
      .from('care_receivers')
      .select('service_code', { count: 'exact' })
      .eq('is_active', true)
      .limit(100)

    if (allData && allData.length > 0) {
      const uniqueCodes = [...new Set(allData.map((item: any) => item.service_code))]
      console.log('[API] Available service_code values in DB:', uniqueCodes)
    }

    // 実際のクエリ
    const { data, error, count } = await supabaseAdmin
      .from('care_receivers')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('service_code', serviceCode)
      .order('name')

    if (error) {
      console.error('[API] Supabase query error:', error)
      return NextResponse.json(
        {
          ok: false,
          serviceCode,
          users: [],
          count: 0,
          error: error.message
        },
        { status: 500 }
      )
    }

    console.log('[API] Query success - count:', count, 'dataLength:', data?.length)

    return NextResponse.json(
      {
        ok: true,
        serviceCode,
        users: data ?? [],
        count: count ?? (data?.length ?? 0),
      },
      { status: 200 }
    )
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[API] Unexpected error:', errMsg, err)
    return NextResponse.json(
      {
        ok: false,
        serviceCode,
        users: [],
        count: 0,
        error: errMsg
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/care-receivers/list
 * 削除済み：lib/actions/careReceiversActions.ts の Server Action を使用してください
 */
