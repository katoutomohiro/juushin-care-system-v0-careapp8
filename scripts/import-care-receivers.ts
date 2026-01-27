/**
 * One-time script to import 24 care receivers from seed.sql
 * Usage: pnpm tsx scripts/import-care-receivers.ts
 * 
 * Prerequisites:
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * - facilities table populated with 'life-care' and 'after-school' slugs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim()
    }
  })
} catch (e) {
  console.warn('⚠️  Could not load .env.local, using existing env vars')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main() {
  console.log('🔍 Step 1: Check facilities/services table')
  
  // Try facilities first (new schema), fallback to services (old schema)
  let facilities
  let facilitiesError
  
  const facilitiesResult = await supabase
    .from('facilities')
    .select('id, slug, name')
    .in('slug', ['life-care', 'after-school'])
  
  if (facilitiesResult.error?.code === 'PGRST205') {
    console.log('⚠️  facilities table not found, trying services table...')
    
    const servicesResult = await supabase
      .from('services')
      .select('id, slug, name')
      .in('slug', ['life-care', 'after-school'])
    
    facilities = servicesResult.data
    facilitiesError = servicesResult.error
  } else {
    facilities = facilitiesResult.data
    facilitiesError = facilitiesResult.error
  }
  
  if (facilitiesError) {
    console.error('❌ Failed to fetch facilities/services:', facilitiesError)
    process.exit(1)
  }
  
  if (!facilities || facilities.length === 0) {
    console.error('❌ No facilities/services found. Need to create them first.')
    console.log('Run this SQL:')
    console.log(`INSERT INTO public.facilities (slug, name) VALUES ('life-care', '生活介護'), ('after-school', '放課後等デイサービス') ON CONFLICT (slug) DO NOTHING;`)
    console.log('OR if using services table:')
    console.log(`INSERT INTO public.services (slug, name) VALUES ('life-care', '生活介護'), ('after-school', '放課後等デイサービス') ON CONFLICT (slug) DO NOTHING;`)
    process.exit(1)
  }
  
  const lifeCareId = facilities.find(f => f.slug === 'life-care')?.id
  const afterSchoolId = facilities.find(f => f.slug === 'after-school')?.id
  
  console.log('✅ Facilities found:')
  console.log(`  - life-care: ${lifeCareId}`)
  console.log(`  - after-school: ${afterSchoolId}`)
  
  console.log('\n📝 Step 2: Prepare care receivers data')
  
  // Simplified: only use code, name, service_code (no facility_id if not in schema)
  const lifeCareReceivers = [
    { code: 'AT_36M', name: 'AT', service_code: 'life-care', is_active: true },
    { code: 'IK_47F', name: 'IK', service_code: 'life-care', is_active: true },
    { code: 'OS_42M', name: 'OS', service_code: 'life-care', is_active: true },
    { code: 'SM_38F', name: 'SM', service_code: 'life-care', is_active: true },
    { code: 'TK_35M', name: 'TK', service_code: 'life-care', is_active: true },
    { code: 'NK_40M', name: 'NK', service_code: 'life-care', is_active: true },
    { code: 'MO_36F', name: 'MO', service_code: 'life-care', is_active: true },
    { code: 'YN_44M', name: 'YN', service_code: 'life-care', is_active: true },
    { code: 'HI_39M', name: 'HI', service_code: 'life-care', is_active: true },
    { code: 'RS_48F', name: 'RS', service_code: 'life-care', is_active: true },
    { code: 'TS_41M', name: 'TS', service_code: 'life-care', is_active: true },
    { code: 'US_48M', name: 'US', service_code: 'life-care', is_active: true },
    { code: 'IT_37M', name: 'IT', service_code: 'life-care', is_active: true },
    { code: 'KT_45F', name: 'KT', service_code: 'life-care', is_active: true },
  ]
  
  const afterSchoolReceivers = [
    { code: 'AK_12M', name: 'AK', service_code: 'after-school', is_active: true },
    { code: 'BM_14F', name: 'BM', service_code: 'after-school', is_active: true },
    { code: 'CM_11M', name: 'CM', service_code: 'after-school', is_active: true },
    { code: 'DN_15M', name: 'DN', service_code: 'after-school', is_active: true },
    { code: 'EO_13F', name: 'EO', service_code: 'after-school', is_active: true },
    { code: 'FP_16M', name: 'FP', service_code: 'after-school', is_active: true },
    { code: 'GQ_10M', name: 'GQ', service_code: 'after-school', is_active: true },
    { code: 'HR_17F', name: 'HR', service_code: 'after-school', is_active: true },
    { code: 'IS_12F', name: 'IS', service_code: 'after-school', is_active: true },
    { code: 'JT_14M', name: 'JT', service_code: 'after-school', is_active: true },
  ]
  
  const allReceivers = [...lifeCareReceivers, ...afterSchoolReceivers]
  console.log(`  Total: ${allReceivers.length} receivers (14 life-care + 10 after-school)`)
  
  console.log('\n💾 Step 3: Upsert care receivers')
  
  const { data: inserted, error: upsertError } = await supabase
    .from('care_receivers')
    .upsert(allReceivers, {
      onConflict: 'code',
      ignoreDuplicates: false,
    })
    .select()
  
  if (upsertError) {
    console.error('❌ Upsert failed:', upsertError)
    process.exit(1)
  }
  
  console.log(`✅ Successfully upserted ${inserted?.length || allReceivers.length} receivers`)
  
  console.log('\n🔍 Step 4: Verify data')
  
  const { data: verification, error: verifyError } = await supabase
    .from('care_receivers')
    .select('service_code')
  
  if (verifyError) {
    console.error('❌ Verification failed:', verifyError)
    process.exit(1)
  }
  
  const counts = verification?.reduce((acc: Record<string, number>, row) => {
    const key = row.service_code || 'null'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  
  console.log('📊 Current distribution:', counts)
  console.log('\n✨ Import complete!')
}

main().catch(console.error)
