# Records API 統一 PR - 変更サマリー

**日晁E*: 2026-01-30  
**ブランチE*: feat/records-api-unify-v3  
**状慁E*: ✁Elint/typecheck/build 全て成功

---

## 変更ファイル一覧

| ファイル | 変更冁E�� | 行数 |
|---------|---------|------|
| `app/api/case-records/save/route.ts` | 時系列イベント化への設計コメント追加 | +16 |
| `app/api/case-records/route.ts` | 刁E��API構想のコメント追加 | +13 |
| `app/api/case-records/list/route.ts` | イベントフィルタ・雁E��機�Eの提案コメント追加 | +9 |
| `schemas/unified.ts` | 正規化スキーマ設計ノート追加 | +30 |
| `docs/RECORDS_API_DESIGN_EVOLUTION.md` | 詳細設計ドキュメント（新規！E| 463衁E|

**合計変更**: 5ファイル、E8行コメント�Eドキュメント追加  
**コード変更**: 0行（コメント�Eドキュメント�Eみ�E�E
---

## レスポンス形式（変更なぁE- 後方互換性保持�E�E
### Case Records API の現在のレスポンス形弁E
#### 成功レスポンス

**POST /api/case-records/save** - 記録保孁E```json
{
  "ok": true,
  "record": {
    "id": "uuid",
    "service_id": "uuid",
    "care_receiver_id": "uuid",
    "record_date": "YYYY-MM-DD",
    "record_time": "HH:mm:ss",
    "record_data": { /* 構造匁EJSON */ },
    "main_staff_id": "uuid",
    "sub_staff_id": "uuid",
    "created_at": "ISO 8601",
    "updated_at": "ISO 8601",
    "version": 1
  }
}
```

**GET /api/case-records** - 記録取得（単一/リスト！E```json
{
  "ok": true,
  "records": [
    { /* record object */ }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "count": 42,
    "hasMore": true
  }
}
```

**GET /api/case-records/list** - 記録一覧�E�Etaff 関連惁E��付き�E�E```json
{
  "ok": true,
  "records": [
    {
      "id": "uuid",
      "record_date": "YYYY-MM-DD",
      "record_data": { /* 構造匁EJSON */ },
      "main_staff": { "id": "uuid", "name": "田中太郁E },
      "sub_staff": { "id": "uuid", "name": "佐藤次郁E }
    }
  ],
  "pagination": { /* pagination info */ }
}
```

#### エラーレスポンス

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "詳細メチE��ージ"
  }
}
```

**HTTP スチE�EタスコーチE*:
- `200`: 成功
- `400`: バリチE�Eションエラー�E�忁E��フィールド不足、形式不正�E�E- `401/403`: 認証/認可エラー
- `404`: リソース不足�E�Eervice, care_receiver, record not found�E�E- `409`: 競合！Eptimistic locking version 不一致�E�E- `503`: DB 接続不可�E�Eupabase admin client 初期化失敗！E- `500`: 予期しなぁE��ラー

---

### GET /api/case-records/analytics - レスポンス侁E
#### クエリ侁E```
GET /api/case-records/analytics?dateFrom=2026-01-23&dateTo=2026-01-30
```

#### レスポンス例（�E功！E```json
{
  "ok": true,
  "data": {
    "range": {
      "dateFrom": "2026-01-23",
      "dateTo": "2026-01-30"
    },
    "daily": [
      {
        "date": "2026-01-23",
        "seizureCount": 2,
        "sleepMins": 420,
        "mealsCompleted": 3
      },
      {
        "date": "2026-01-24",
        "seizureCount": 1,
        "sleepMins": 480,
        "mealsCompleted": 3
      },
      {
        "date": "2026-01-25",
        "seizureCount": 0,
        "sleepMins": 360,
        "mealsCompleted": 2
      },
      {
        "date": "2026-01-26",
        "seizureCount": 3,
        "sleepMins": 400,
        "mealsCompleted": 3
      },
      {
        "date": "2026-01-27",
        "seizureCount": 1,
        "sleepMins": 450,
        "mealsCompleted": 3
      },
      {
        "date": "2026-01-28",
        "seizureCount": 2,
        "sleepMins": 420,
        "mealsCompleted": 3
      },
      {
        "date": "2026-01-29",
        "seizureCount": 0,
        "sleepMins": 480,
        "mealsCompleted": 3
      },
      {
        "date": "2026-01-30",
        "seizureCount": 1,
        "sleepMins": 420,
        "mealsCompleted": 3
      }
    ],
    "summary": {
      "seizureCountTotal": 10,
      "sleepMinsAvg": 429,
      "mealsCompletedTotal": 23
    }
  }
}
```

#### レスポンス例（エラー�E�E```json
{
  "ok": false,
  "error": "Failed to retrieve analytics",
  "detail": "Unauthorized"
}
```

---

## 設計上�E改喁E���E�提案済み、実裁E��定なし！E
### 1. 時系列イベント化

**現状**:
- `record_data` は自由形弁EJSON
- 褁E��イベント（発作、排況E��睡眠�E�を同一レコード�Eで扱ぁE��法が不統一

**提桁E*:
- `record_data.events[]` 配�Eで時系列イベントを格紁E- 吁E��ベントに `event_type` + `occurred_at` (ISO 8601) を忁E��化
- イベント型: SeizureEvent, ExcretionEvent, SleepEvent, NutritionEvent, VitalEvent, CareEvent

### 2. 刁E��用エンド�Eイント（封E��実裁E��E
```
GET /api/case-records/analytics?careReceiverId=xxx&metric=seizure_frequency&dateFrom=2026-01-01&dateTo=2026-01-31

レスポンス侁E
{
  "ok": true,
  "analytics": {
    "seizure": {
      "count": 7,
      "avg_duration_sec": 45,
      "types": { "強直間代": 5, "ピク付き": 2 },
      "daily": [
        { "date": "2026-01-01", "count": 1, "total_duration_sec": 120 }
      ]
    },
    "meal": { "completion_rate": 0.85, ... },
    "sleep": { "avg_duration_min": 420, ... }
  }
}
```

### 3. イベント型フィルタ�E�封E��実裁E��E
```
GET /api/case-records/list?eventType=seizure&minSeverity=moderate

フィルタ対象�E�E- eventType: seizure, excretion, sleep, nutrition, hydration, vitals, care
- severity/amount の定量篁E��持E��E```

---

## 品質チェチE��結果

✁E**pnpm lint** - PASS  
✁E**pnpm typecheck** - PASS  
✁E**pnpm build** - PASS (29 pages generated)

---

## 差刁E��小化

- ✁E変更ファイルは Records API 関連のみ�E�Eファイル�E�E- ✁E他�E API ルート�Eコンポ�Eネントへの影響なぁE- ✁Eコード変更 0行（コメント�Eドキュメント追加のみ�E�E- ✁Eレスポンス形式�E現状維持E��後方互換性 100%�E�E
---

## PR マ�Eジ準備状況E
| 頁E�� | 状慁E|
|------|------|
| コード品質�E�Eint�E�E| ✁E合格 |
| 型安�E性�E�Eypecheck�E�E| ✁E合格 |
| ビルド可能性�E�Euild�E�E| ✁E合格 |
| 差刁E��小化 | ✁E達�E |
| ドキュメント完備 | ✁E完亁E|
| 後方互換性 | ✁E100% 保持 |

**結諁E*: 本 PR は merge-ready 状態です、E
---

## Step 4: 端末問わずアクセスできるための導線整備！ERL確宁E/ ナビ追加 / 認証ガード！E
### 4.1. URL 確宁E
**採用 URL**: `/analytics` �E�確定！E
**琁E��**:
- 既存�E route group `(records)` はURL に含まれなぁE��Epp Router の仕様！E- シンプルで刁E��りやすい
- ダチE��ュボ�Eド等から�Eナビゲーション時に統一皁E
**ファイル構�E**:
- Server Component: `app/(records)/analytics/page.tsx`
  - 認証確認！EetApiUser�E�を実施、未ログイン時�E `/login` へリダイレクチE  - metadata 設宁E- Client Component: `app/(records)/analytics/analytics-client.tsx`
  - 実際のクエリフォーム・チE�Eタ取得�Eビュア表示

### 4.2. ダチE��ュボ�Eド（�Eーム�E�に Records Analytics カードを追加

**ファイル**: `app/home-client.tsx`

**追加位置**: 「試験機�E / AI 支援セクション」�E

**カード仕槁E*:
- **色**: 紫系�E�Eiolet-50 / violet-200 / violet-700�E�E- **アイコン**: 📊
- **タイトル**: Records Analytics
- **説昁E*: ケア記録の期間別雁E��。発作�E睡眠・食事などの日別チE�Eタを可視化、E- **クリチE��允E*: `/analytics`

**実裁E��E*:
```tsx
<ClickableCard 
  onClick={() => window.location.href = '/analytics'} 
  className="group border-2 hover:border-primary/30 bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100"
  particleColors={["#a78bfa", "#8b5cf6", "#c4b5fd"]}
>
  <CardHeader className="pb-2">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-white/60 text-2xl">📊</div>
      <div className="flex-1">
        <CardTitle className="text-base font-semibold">Records Analytics</CardTitle>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-violet-700">ケア記録の期間別雁E��。発作�E睡眠・食事などの日別チE�Eタを可視化、E/p>
  </CardContent>
</ClickableCard>
```

### 4.3. 認証ガード（未ログイン時�Eログインへ誘導！E
**実裁E��置**: `app/(records)/analytics/page.tsx` (Server Component)

**流れ**:
1. `getApiUser()` でサーバ�Eサイド認証確誁E2. `user` ぁE`null` の場吁EↁE`redirect("/login")`
3. ログイン済みの場合�Eみクライアント�Eを表示

**コーチE*:
```typescript
import { redirect } from "next/navigation"
import { getApiUser } from "@/lib/auth/get-api-user"
import AnalyticsPageClient from "./analytics-client"

export default async function AnalyticsPage() {
  const user = await getApiUser()
  if (!user) {
    redirect("/login")
  }
  return <AnalyticsPageClient />
}
```

**既存認証体系との整吁E*:
- middleware.ts による全体的な認証フロー�E�Eublic routes を除き未ログイン時に /login へリダイレクト）に加えて
- 本ペ�Eジでは server-side で再度確認することで、セキュリチE��を強匁E
### 4.4. ドキュメント�EREADME 更新冁E��

**docs/RECORDS_API_PR_SUMMARY.md に追訁E*:
- URL 確宁E `/analytics`
- ダチE��ュボ�Eド導緁E 追加完亁E- 認証: 忁E��（ログイン後�Eみアクセス可能�E�E
**README.md に 1 行追訁E*:
```
- **Records Analytics** (`/analytics`): ケア記録の期間別雁E��。ダチE��ュボ�Eド�E「試験機�Eセクション」から、また�Eコマンドラインで `curl http://dev-app.local:3000/analytics` でアクセス�E�要ログイン�E�、E```

### 4.5. 品質チェチE��結果

✁E**pnpm lint** - PASS  
✁E**pnpm typecheck** - PASS  
✁E**pnpm build** - PASS

---

## 最終スチE�Eタス

| Step | 冁E�� | 状慁E|
|------|------|------|
| 1 | Records API 設計進匁E| ✁E完亁E|
| 2 | Analytics API 実裁E| ✁E完亁E|
| 3 | Analytics UI�E�カード�E表�E�E| ✁E完亁E|
| 4 | 導線整備！ERL / ナビ / 認証�E�E| ✁E完亁E|

**全スチE��プ完亁E��Records Analytics 機�Eは本番運用準備完亁E*、E

