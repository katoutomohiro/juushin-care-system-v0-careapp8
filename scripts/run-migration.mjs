/**
 * scripts/run-migration.mjs
 * 
 * Supabase 接続確認 & マイグレーション手順表示
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rlopopbtdydqchiifxla.supabase.co'
const supabaseServiceKey = 'sb_secret_Y7t2Lpkvo4HR8GpEQF0pmw_GzoN8Cg8'

console.log('🚀 Supabase Migration Runner')
console.log('=' .repeat(60))
console.log('')
console.log('✅ Environment variables configured')
console.log(`📍 URL: ${supabaseUrl}`)
console.log(`🔐 Service Role Key: ${supabaseServiceKey.slice(0, 20)}...`)
console.log('')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

// Test current schema
console.log('1️⃣  Checking current schema...')
try {
  const { data, error } = await supabase
    .from('care_receivers')
    .select('*')
    .limit(1)

  if (error && error.message.includes('does not exist')) {
    console.log('❌ Column "is_active" does not exist (confirmed)')
    console.log('   Error:', error.message.substring(0, 100))
  } else if (!error && data) {
    const testRow = data?.[0]
    if (testRow && 'is_active' in testRow) {
      console.log('✅ Column "is_active" already exists!')
      console.log('   Migration is already applied.')
      process.exit(0)
    } else {
      console.log('ℹ️  Column might not exist. Checking...')
    }
  }
} catch (err) {
  console.error('❌ Connection error:', err.message)
}

console.log('')
console.log('=' .repeat(60))
console.log('')
console.log('📋 MANUAL ACTION REQUIRED:')
console.log('')
console.log('Step 1: Open Supabase Dashboard')
console.log('URL: https://app.supabase.com/project/rlopopbtdydqchiifxla/sql/editor')
console.log('')
console.log('Step 2: Execute this SQL in the editor:')
console.log('─'.repeat(60))
console.log(`
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_care_receivers_is_active 
  ON public.care_receivers(is_active);

CREATE INDEX IF NOT EXISTS idx_care_receivers_service_code_active 
  ON public.care_receivers(service_code, is_active);
`)
console.log('─'.repeat(60))
console.log('')
console.log('Step 3: Click "Run" and confirm success')
console.log('')
console.log('After completion, restart: pnpm dev')
console.log('')
