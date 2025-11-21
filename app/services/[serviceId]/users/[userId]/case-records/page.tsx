import { userDetails } from '@/lib/user-master-data'
import { buildUserProfileFromUserDetail } from '@/types/user-profile'
import { fetchCaseRecordByDate } from '@/lib/case-records'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import GenerateCaseRecordButton from './_components/generate-button'

interface PageProps { params: { serviceId: string; userId: string }; searchParams?: { date?: string } }

export default async function CaseRecordsPage({ params, searchParams }: PageProps) {
  const { serviceId, userId } = params
  const dateStr = searchParams?.date || format(new Date(), 'yyyy-MM-dd')
  const detail = userDetails[userId]
  if (!detail) {
    return <div className="p-6">利用者が見つかりません。</div>
  }
  const profile = buildUserProfileFromUserDetail(detail)
  const rows = await fetchCaseRecordByDate(userId, serviceId, dateStr).catch(() => [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Link href={`/services/${serviceId}/users/${encodeURIComponent(userId)}`} className="text-sm underline">← {userId}の詳細へ戻る</Link>
          <h1 className="text-2xl font-bold">ケース記録</h1>
          <span className="text-sm text-muted-foreground">{format(new Date(dateStr), 'yyyy年MM月dd日', { locale: ja })}</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card>
          <CardHeader><CardTitle>利用者情報</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">年齢:</span> {profile.age}歳</div>
              <div><span className="text-muted-foreground">性別:</span> {profile.gender}</div>
              {profile.disabilityType && <div className="md:col-span-2"><span className="text-muted-foreground">障害種別/区分:</span> {profile.disabilityType}</div>}
              {profile.condition && <div className="md:col-span-2"><span className="text-muted-foreground">基礎疾患:</span> {profile.condition}</div>}
              {profile.medicalCare && <div className="md:col-span-2"><span className="text-muted-foreground">医療的ケア:</span> {profile.medicalCare}</div>}
              {profile.handbook && <div><span className="text-muted-foreground">手帳等:</span> {profile.handbook}</div>}
              {profile.assist && <div><span className="text-muted-foreground">介助状況:</span> {profile.assist}</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>日誌要約</CardTitle></CardHeader>
          <CardContent>
            {rows.length === 0 && <p className="text-sm text-muted-foreground">この日のケース記録は未作成です。日誌を保存すると自動作成されます。</p>}
            <div className="mb-4"><GenerateCaseRecordButton userId={userId} serviceType={serviceId} date={dateStr} /></div>
            <div className="space-y-4">
              {rows.map(r => (
                <div key={r.section + '-' + r.item_key} className="text-sm">
                  <div className="font-medium">{sectionLabel(r.section)}</div>
                  <div className="text-muted-foreground">{r.item_value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>自由記述 (未実装)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">後続で職員が追記できるメモ欄を追加予定です。</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function sectionLabel(section: string) {
  switch (section) {
    case 'vital': return 'バイタル'
    case 'seizure': return '発作'
    case 'hydration': return '水分'
    case 'excretion': return '排泄'
    case 'activity': return '活動'
    default: return section
  }
}
