import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { 
  isRealPiiEnabled, 
  omitPii, 
  requireApiUser, 
  unauthorizedResponse,
  unexpectedErrorResponse,
  ensureSupabaseAdmin,
  supabaseErrorResponse,
  jsonError
} from "@/lib/api/route-helpers"

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
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    const { searchParams } = new URL(req.url)
    const serviceCode = searchParams.get('serviceCode') ?? ''

    console.log('[API] GET /care-receivers/list - serviceCode:', serviceCode)

    const allowRealPii = isRealPiiEnabled()

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return jsonError('Database not available', 503, {
        ok: false,
        detail: 'Supabase admin client not initialized',
        extra: { serviceCode, users: [], count: 0 }
      })
    }

    // 診断用：絞り込みなしで全件取得してservice_codeを確認
    const { data: allData, error: _allError } = await supabaseAdmin!
      .from('care_receivers')
      .select('service_code', { count: 'exact' })
      .eq('is_active', true)
      .limit(100)

    if (allData && allData.length > 0) {
      const uniqueCodes = [...new Set(allData.map((item: any) => item.service_code))]
      console.log('[API] Available service_code values in DB:', uniqueCodes)
    }

    // 実際のクエリ
    const { data, error, count } = await supabaseAdmin!
      .from('care_receivers')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('service_code', serviceCode)
      .order('name')

    if (error) {
      return supabaseErrorResponse('care-receivers/list GET', error, {
        serviceCode,
        users: [],
        count: 0
      })
    }

    console.log('[API] Query success - count:', count, 'dataLength:', data?.length)

    const users = allowRealPii ? (data ?? []) : (data ?? []).map((row: Record<string, unknown>) => omitPii(row))

    return NextResponse.json(
      {
        ok: true,
        serviceCode,
        users,
        count: count ?? (data?.length ?? 0),
      },
      { status: 200 }
    )
  } catch (err) {
    return unexpectedErrorResponse('care-receivers/list GET', err)  }
}

/**
 * POST /api/care-receivers/list
 * 削除済み：lib/actions/careReceiversActions.ts の Server Action を使用してください
 */