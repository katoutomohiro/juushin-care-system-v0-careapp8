#!/usr/bin/env node

/**
 * scripts/apply-supabase-migration.mjs
 * 
 * Supabase CLI を使用してマイグレーション適用
 * 前提: supabase CLI がインストール済み
 * 
 * 使用方法:
 *   npm run migrate:apply
 *   または
 *   node scripts/apply-supabase-migration.mjs
 */

import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

console.log('🚀 Supabase Migration Helper')
console.log('=' .repeat(60))

// 1. Check if supabase CLI is installed
console.log('\n1️⃣  Checking Supabase CLI...')
const versionResult = spawnSync('supabase', ['--version'], {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe']
})

if (versionResult.error || versionResult.status !== 0) {
  console.error('❌ Supabase CLI not found')
  console.log('\n📦 Install with:')
  console.log('   npm install -g supabase')
  console.log('\n📖 Or follow: https://supabase.com/docs/guides/cli')
  process.exit(1)
}

console.log('✅ Supabase CLI:', versionResult.stdout.trim())

// 2. List migrations
console.log('\n2️⃣  Available migrations:')
const migrationsDir = path.join(projectRoot, 'supabase', 'migrations')
const { default: fs } = await import('fs')
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'))

files.forEach((file, i) => {
  const isLatest = file === '20260116_consolidate_care_receivers_schema.sql'
  const prefix = isLatest ? '⭐' : '  '
  console.log(`${prefix} ${i + 1}. ${file}`)
})

// 3. Instructions
console.log('\n3️⃣  To apply migrations manually:')
console.log('')
console.log('Option A: Push all migrations')
console.log('  $ supabase db push')
console.log('')
console.log('Option B: Use Supabase Dashboard')
console.log('  1. Go to SQL Editor')
console.log('  2. Open: supabase/migrations/20260116_consolidate_care_receivers_schema.sql')
console.log('  3. Copy SQL and run in Supabase Dashboard')
console.log('')
console.log('Option C: Direct psql (requires psql installed)')
console.log('  See MIGRATION_GUIDE.md for service role connection details')
console.log('')

// 4. Offer to open migration file
console.log('\n4️⃣  Latest migration file content:\n')
const latestMigration = path.join(migrationsDir, '20260116_consolidate_care_receivers_schema.sql')
const content = fs.readFileSync(latestMigration, 'utf8')
console.log(content)

console.log('\n' + '='.repeat(60))
console.log('✅ Ready to apply!')
console.log('📋 Copy the SQL above and execute in Supabase Dashboard')
