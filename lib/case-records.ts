import { createClient } from '@supabase/supabase-js'

// 環境変数から Supabase クライアント生成（既存設定がある場合は置き換えても問題ない）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const supabaseCaseRecords = createClient(supabaseUrl, supabaseKey)

export interface CaseRecordRow {
  id?: string
  user_id: string
  service_type: string
  record_date: string // ISO Date
  section: string
  item_key: string
  item_value?: string
  source?: string
  created_at?: string
  updated_at?: string
}

export async function fetchCaseRecordByDate(userId: string, serviceType: string, recordDate: string): Promise<CaseRecordRow[]> {
  const { data, error } = await supabaseCaseRecords
    .from('case_records')
    .select('*')
    .eq('user_id', userId)
    .eq('service_type', serviceType)
    .eq('record_date', recordDate)
  if (error) throw error
  return data || []
}

// 日誌JSON例から CaseRecordRow[] を構築（MVP: A・T 専用だが汎用化しやすい形）
export function buildCaseRecordRowsFromDailyLog(userId: string, serviceType: string, recordDate: string, dailyLog: any): CaseRecordRow[] {
  const rows: CaseRecordRow[] = []
  if (!dailyLog) return rows

  // バイタル
  if (dailyLog.vitals) {
    const v = dailyLog.vitals
    const summary = [v.temperature && `体温 ${v.temperature}℃`, v.bp && `血圧 ${v.bp}`, v.hr && `脈拍 ${v.hr}`].filter(Boolean).join(' / ')
    rows.push({ user_id: userId, service_type: serviceType, record_date: recordDate, section: 'vital', item_key: 'summary', item_value: summary })
  }
  // 発作
  if (dailyLog.seizures) {
    const s = dailyLog.seizures
    const summary = `回数 ${s.count ?? '?'}回 / 最長 ${s.longest ?? '?'}分${s.type ? ` / タイプ ${s.type}` : ''}`
    rows.push({ user_id: userId, service_type: serviceType, record_date: recordDate, section: 'seizure', item_key: 'summary', item_value: summary })
  }
  // 水分
  if (dailyLog.hydration) {
    const h = dailyLog.hydration
    const summary = `総量 ${h.total ?? '?'}ml / 方法 ${(h.method || []).join(',')}`
    rows.push({ user_id: userId, service_type: serviceType, record_date: recordDate, section: 'hydration', item_key: 'summary', item_value: summary })
  }
  // 排泄
  if (dailyLog.excretion) {
    const e = dailyLog.excretion
    const summary = `排尿 ${e.urination ?? '?'}回 / 排便 ${e.defecation ?? '?'}回` + (e.detail ? ` / 詳細 ${e.detail}` : '')
    rows.push({ user_id: userId, service_type: serviceType, record_date: recordDate, section: 'excretion', item_key: 'summary', item_value: summary })
  }
  // 活動
  if (Array.isArray(dailyLog.events)) {
    const activities = dailyLog.events.filter((ev: any) => ev.type === 'activity').map((ev: any) => ev.title || ev.summary || ev.type)
    if (activities.length) {
      const summary = activities.slice(0, 5).join('、') + (activities.length > 5 ? '…' : '')
      rows.push({ user_id: userId, service_type: serviceType, record_date: recordDate, section: 'activity', item_key: 'summary', item_value: summary })
    }
  }
  return rows
}

export async function upsertCaseRecordFromDailyLog(userId: string, serviceType: string, recordDate: string, dailyLog: any): Promise<void> {
  const rows = buildCaseRecordRowsFromDailyLog(userId, serviceType, recordDate, dailyLog)
  for (const row of rows) {
    const { error } = await supabaseCaseRecords
      .from('case_records')
      .upsert({ ...row, source: 'daily-log', updated_at: new Date().toISOString() })
    if (error) throw error
  }
}
