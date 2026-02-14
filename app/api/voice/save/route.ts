import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { 
  requireApiUser, 
  unauthorizedResponse,
  unexpectedErrorResponse,
  validateRequiredFields,
  missingFieldsResponse,
  jsonError
} from '@/lib/api/route-helpers'

export const runtime = 'nodejs'

/**
 * POST /api/voice/save
 * JSON { text, durationMs, avgLevel, device? } を受け取り、Supabase の voice_notes に挿入。
 * NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未設定時は DRY-RUN を返す（安全フォールバック）。
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(false)
    }

    const body = await req.json()
    const { text, durationMs, avgLevel, device } = body

    // Validate required fields
    const validation = validateRequiredFields(
      { text },
      ['text']
    )
    if (!validation.valid) {
      return missingFieldsResponse(validation.missingFields.map(String))
    }

    // Validate text format
    if (typeof text !== 'string' || text.trim().length === 0) {
      return jsonError('text must be a non-empty string', 400, { ok: false })
    }

    // Validate durationMs
    if (typeof durationMs !== 'number' || durationMs < 0) {
      return jsonError('durationMs must be a non-negative number', 400, { ok: false })
    }

    const supabaseUrl = SUPABASE_URL
    const supabaseServiceKey = SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      // DRY-RUN: 環境変数未設定
      return NextResponse.json(
        {
          id: 'dry-run-id',
          message: '[DRY-RUN] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set',
        },
        { status: 201 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    const { data, error } = await supabase
      .from('voice_notes')
      .insert({
        duration_ms: durationMs,
        text: text.trim(),
        avg_level: avgLevel ?? null,
        device: device ?? null,
        user_id: null, // 将来的に認証対応
      })
      .select('id')
      .single()

    if (error) {
      console.error('[voice/save POST] Supabase insert error:', error)
      return jsonError(
        error.message || 'Database insert failed',
        500,
        {
          ok: false,
          detail: 'Check Supabase schema and permissions'
        }
      )
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (e: any) {
    return unexpectedErrorResponse('voice/save POST', e)
  }
}
