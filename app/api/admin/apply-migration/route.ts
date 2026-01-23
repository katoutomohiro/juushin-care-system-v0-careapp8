import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

/**
 * POST /api/admin/apply-migration
 * 
 * 【警告】開発用のみ。本番では削除または厳重に保護
 * 
 * care_receivers スキーマ統合マイグレーション実行
 * - is_active 列追加
 * - インデックス作成
 */
export async function POST(req: NextRequest) {
  try {
    // 環境変数でチェック（簡易認証）
    const authToken = req.headers.get('x-admin-token')
    const expectedToken = process.env.ADMIN_MIGRATION_TOKEN
    
    if (!expectedToken || authToken !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 503 }
      )
    }

    // マイグレーション SQL
    const migrationSql = `
-- Consolidate care_receivers schema
-- Remove display_name (unused, always empty)
-- Ensure service_code is populated from services.slug
-- Add is_active for logical deletion

-- Drop display_name column (unused)
ALTER TABLE IF EXISTS public.care_receivers
DROP COLUMN IF EXISTS display_name CASCADE;

-- Add is_active for logical deletion (default true)
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_care_receivers_is_active 
  ON public.care_receivers(is_active);

-- Update service_code from service_id's slug (one-time data sync)
UPDATE public.care_receivers cr
SET service_code = s.slug
FROM public.services s
WHERE cr.service_id = s.id AND cr.service_code = 'life-care';

-- Create composite index on service_code + is_active for common queries
CREATE INDEX IF NOT EXISTS idx_care_receivers_service_code_active 
  ON public.care_receivers(service_code, is_active);
    `

    // SQL を実行
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: migrationSql })

    if (error) {
      console.error('[Migration] Error executing SQL:', error)
      
      // RPC がない場合は raw_sql で試す
      try {
        const result = await supabaseAdmin.from('_pg_stat_statements').select('*')
        console.log('[Migration] Fallback: Attempting direct SQL execution...')
      } catch (fallbackErr) {
        // SQL 実行の代替方法
      }

      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      )
    }

    console.log('[Migration] SQL executed successfully')
    return NextResponse.json(
      { 
        success: true, 
        message: 'Migration applied successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Migration] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/apply-migration
 * 
 * マイグレーション状態確認
 */
export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 503 }
      )
    }

    // care_receivers テーブルのカラム確認
    const { data, error } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'care_receivers')

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      )
    }

    const columns = (data || []).map((col: any) => col.column_name)
    const hasIsActive = columns.includes('is_active')

    return NextResponse.json(
      {
        status: 'OK',
        careReceivers: {
          hasIsActiveColumn: hasIsActive,
          columns: columns,
        },
        migrations: {
          required: !hasIsActive,
        },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Migration Status] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    )
  }
}
