import { NextResponse } from 'next/server'
import { upsertCaseRecordFromDailyLog } from '@/lib/case-records'
import { userDetails } from '@/lib/user-master-data'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, serviceType, recordDate, dailyLog } = body
    if (!userId || !serviceType || !recordDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!userDetails[userId]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    await upsertCaseRecordFromDailyLog(userId, serviceType, recordDate, dailyLog)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[case-records/upsert] error', e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
