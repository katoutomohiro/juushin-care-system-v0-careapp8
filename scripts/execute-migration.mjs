/**
 * scripts/execute-migration.mjs
 * 
 * Supabase PostgreSQL に直接 SQL を実行
 * 使用: PGPASSWORD=... node scripts/execute-migration.mjs
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

// Extract project ID and region
const projectMatch = supabaseUrl.match(/https:\/\/([a-zA-Z0-9]+)\.supabase\.co/)
if (!projectMatch) {
  console.error('❌ Invalid Supabase URL format')
  process.exit(1)
}

const projectId = projectMatch[1]
const dbUrl = `postgresql://postgres:${supabaseServiceKey}@db.${projectId}.supabase.co:5432/postgres`

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

async function executeMigration() {
  console.log('🚀 Executing migration via PostgreSQL connection...')
  console.log(`📍 Project: ${projectId}`)

  try {
    // Write SQL to temp file
    const tempSqlFile = path.join(__dirname, '.tmp-migration.sql')
    const fs = await import('fs').then(m => m.promises)
    await fs.writeFile(tempSqlFile, migrationSql, 'utf8')

    console.log('📝 Executing SQL statements...\n')

    // Execute with psql
    const { stdout, stderr } = await execAsync(
      `psql "${dbUrl}" -f "${tempSqlFile}"`,
      {
        maxBuffer: 1024 * 1024 * 10, // 10MB
        timeout: 30000, // 30s
      }
    )

    if (stderr) {
      console.log('⚠️  stderr:', stderr)
    }

    if (stdout) {
      console.log('✅ SQL executed successfully!')
      console.log(stdout)
    }

    // Cleanup
    await fs.unlink(tempSqlFile).catch(() => {})

    console.log('\n🎉 Migration completed successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error executing migration:', err.message)
    
    // Try psql from PATH
    try {
      await execAsync('psql --version')
    } catch {
      console.log('\n⚠️  psql not found in PATH')
      console.log('📋 Please apply manually via Supabase Dashboard:')
      console.log('https://app.supabase.com → SQL Editor → New Query\n')
      console.log(migrationSql)
    }

    process.exit(1)
  }
}

executeMigration()
