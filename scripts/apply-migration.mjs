/**
 * scripts/apply-migration.mjs
 * 
 * Supabase migration を直接実行するスクリプト
 * 使用: node scripts/apply-migration.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const migrationSql = `
-- Consolidate care_receivers schema
-- Add is_active for logical deletion

-- 1. Add is_active for logical deletion (default true)
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 2. Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_care_receivers_is_active 
  ON public.care_receivers(is_active);

-- 3. Create composite index on service_code + is_active for common queries
CREATE INDEX IF NOT EXISTS idx_care_receivers_service_code_active 
  ON public.care_receivers(service_code, is_active);
`

async function runMigration() {
  console.log('🚀 Applying migration...')
  console.log('📝 SQL:')
  console.log(migrationSql)
  console.log('\n---\n')

  try {
    console.log('🔍 Checking if care_receivers.is_active column exists...')
    
    // Try querying the table to see if is_active exists
    const { data: testData, error: testError } = await supabase
      .from('care_receivers')
      .select('is_active')
      .limit(1)

    if (testError?.message?.includes('column "is_active" does not exist')) {
      console.log('\n❌ Column "is_active" does not exist in Supabase')
      console.log('\n⚠️  MANUAL ACTION REQUIRED:')
      console.log('1. Go to Supabase Dashboard: https://app.supabase.com')
      console.log('2. Select project: rlopopbtdydqchiifxla')
      console.log('3. Go to SQL Editor → New Query')
      console.log('4. Paste the following SQL:\n')
      console.log('═'.repeat(60))
      console.log(migrationSql)
      console.log('═'.repeat(60))
      console.log('\n5. Click "Run" button')
      console.log('6. Confirm all statements executed without errors')
      process.exit(1)
    } else if (testError) {
      console.error('❌ Database error:', testError.message)
      process.exit(1)
    }
    
    if (testData !== undefined && testData !== null) {
      console.log('✅ Migration already applied: is_active column exists!')
      console.log('📊 Sample row retrieved successfully')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

runMigration()
