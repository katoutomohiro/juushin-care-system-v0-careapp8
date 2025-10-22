import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * POST /api/voice/save
 * JSON { text, durationMs, avgLevel, device? } を受け取り、Supabase の voice_notes に挿入。
 * SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未設定時は DRY-RUN を返す（安全フォールバック）。
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, durationMs, avgLevel, device } = body

    // バリデーション
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required and must be non-empty' }, { status: 400 })
    }
    if (typeof durationMs !== 'number' || durationMs < 0) {
      return NextResponse.json({ error: 'durationMs must be a non-negative number' }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      // DRY-RUN: 環境変数未設定
      return NextResponse.json(
        {
          id: 'dry-run-id',
          message: '[DRY-RUN] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set',
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
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: error.message || 'Database insert failed', hint: 'Check Supabase schema and permissions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (e: any) {
    console.error('voice/save error:', e)
    return NextResponse.json(
      { error: e.message || 'Internal error', hint: 'Server-side exception during save' },
      { status: 500 }
    )
  }
}
