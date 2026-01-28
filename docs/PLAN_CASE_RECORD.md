# ケース記録機能｜仕様書

> **📌 対象読者**: ケース記録機能を実装・修正する開発者  
> **前提**: `docs/PLAN_MASTER.md` を先に読んでいること  
> **完成形リファレンス**: ATさんのページ (`/services/life-care/users/AT/case-records`)

---

## 🎯 ケース記録機能の目的

医療・介護現場で、スタッフが利用者（重症心身障がい児者）の日々のケア内容を記録するための機能。

### 主な用途
- 日ごとのケア実施記録（主担当・副担当スタッフ、日付、内容）
- カスタムフィールド（利用者ごとの個別記録項目）
- 家族への特記事項、スタッフ間の引き継ぎ事項

### 重要なセキュリティ要件
- **同時編集制御**: 複数スタッフが同じ記録を編集しても上書きされない（楽観ロック）
- **RLS（Row Level Security）**: Supabase で利用者ごとにアクセス制御
- **バリデーション**: 必須フィールドチェック、日付形式検証

---

## 📋 ATさん = 完成形リファレンス

**ATさんとは**: 開発・テスト用の利用者アカウント（userId: "AT"）

### ATさんのページ構成

| URL | 説明 |
|-----|------|
| `/services/life-care/users/AT` | ATさんのプロフィールページ |
| `/services/life-care/users/AT/case-records` | ATさんのケース記録ページ（**完成形**） |

### ATさんのケース記録で実装済み機能

1. **フォーム UI**
   - 日付選択（DatePicker）
   - 主担当スタッフ選択（ドロップダウン）
   - 副担当スタッフ選択（ドロップダウン）
   - 特記事項（テキストエリア）
   - 家族への連絡事項（テキストエリア）
   - カスタムフィールド（テンプレートベース）

2. **データ保存**
   - `/api/case-records/save` API に POST
   - `version` パラメータで楽観ロック
   - 保存成功時に一覧リフレッシュ

3. **同時編集制御**
   - 409 Conflict 時にダイアログ表示
   - 「最新データを再読み込み」ボタン

4. **一覧表示**
   - 保存済みケース記録の一覧表示（CaseRecordsListClient）
   - 日付降順でソート

---

## 🗂️ データ構造

### case_records テーブル（Supabase）

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|------|
| `id` | UUID | レコードID（主キー） | ✅ |
| `care_receiver_id` | UUID | 利用者ID（外部キー） | ✅ |
| `service_id` | UUID | サービスID（外部キー） | ✅ |
| `date` | DATE | 記録日付 | ✅ |
| `main_staff_id` | UUID | 主担当スタッフID | ✅ |
| `sub_staff_id` | UUID | 副担当スタッフID | ❌ |
| `special_notes` | TEXT | 特記事項 | ❌ |
| `family_notes` | TEXT | 家族への連絡事項 | ❌ |
| `custom` | JSONB | カスタムフィールド（テンプレート） | ❌ |
| `version` | INTEGER | 楽観ロック用バージョン | ✅ |
| `created_at` | TIMESTAMP | 作成日時 | ✅ |
| `updated_at` | TIMESTAMP | 更新日時 | ✅ |

### TypeScript 型定義

```typescript
// src/lib/case-records/form-schemas.ts
export type CaseRecordFormData = {
  date: string                    // YYYY-MM-DD
  careReceiverName: string
  serviceId: string               // UUID
  mainStaffId: string | null      // UUID
  subStaffId: string | null       // UUID
  specialNotes: string
  familyNotes: string
  custom: Record<string, any>     // カスタムフィールド
}

// API レスポンス型
export type CaseRecordResponse = {
  record: {
    id: string
    care_receiver_id: string
    service_id: string
    date: string
    main_staff_id: string
    sub_staff_id: string | null
    special_notes: string
    family_notes: string
    custom: Record<string, any>
    version: number                // 楽観ロック用
    created_at: string
    updated_at: string
  }
}
```

---

## 🔐 楽観ロック（同時編集制御）

### 仕組み

1. **フォーム読み込み時**: 既存レコードの `version` を取得
2. **保存時**: `version` を API リクエストに含める
3. **API 側チェック**: 
   ```sql
   UPDATE case_records 
   SET ... 
   WHERE id = $1 AND version = $2  -- バージョンが一致するレコードのみ更新
   ```
4. **競合検出**: 更新件数が 0 件 → 409 Conflict を返却
5. **フロント処理**: 409 受信時にダイアログ表示

### 実装ファイル

| ファイル | 説明 |
|---------|------|
| `supabase/migrations/20260128093212_add_version_to_case_records.sql` | `version` カラム追加 + トリガー |
| `app/api/case-records/save/route.ts` | 保存API（409 Conflict 対応） |
| `src/components/case-records/CaseRecordFormClient.tsx` | フロント（ダイアログ表示） |

詳細設計: `docs/CONCURRENCY.md` 参照

---

## 📄 カスタムフィールド（テンプレート）

### テンプレートとは

利用者ごとに異なる記録項目を定義できる仕組み。

**例: ATさんのカスタムフィールド**
```json
{
  "customFields": [
    {
      "id": "breathing_support",
      "label": "呼吸補助",
      "type": "select",
      "options": ["不要", "酸素吸入", "人工呼吸器"]
    },
    {
      "id": "food_intake",
      "label": "食事摂取量",
      "type": "text"
    },
    {
      "id": "seizure_count",
      "label": "発作回数",
      "type": "number"
    }
  ]
}
```

### テンプレート取得

```typescript
// app/services/[serviceId]/users/[userId]/case-records/page.tsx
const template = await getCareReceiverTemplate(careReceiverUuid)

// template.customFields を CaseRecordForm に渡す
<CaseRecordForm
  templateFields={template?.customFields || []}
  ...
/>
```

### フォームでの表示

```typescript
// src/components/case-records/CaseRecordForm.tsx
{templateFields.map((field) => (
  <div key={field.id}>
    <Label>{field.label}</Label>
    {field.type === 'select' ? (
      <Select onValueChange={(val) => handleCustomFieldChange(field.id, val)}>
        {field.options?.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </Select>
    ) : (
      <Input
        type={field.type}
        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
      />
    )}
  </div>
))}
```

---

## 🔧 API エンドポイント

### POST /api/case-records/save

#### リクエスト
```typescript
{
  recordId?: string              // 既存レコード更新時のみ
  version?: number               // 楽観ロック用（既存レコード更新時のみ）
  careReceiverId: string         // UUID
  serviceId: string              // UUID
  date: string                   // YYYY-MM-DD
  mainStaffId: string            // UUID
  subStaffId: string | null      // UUID
  specialNotes: string
  familyNotes: string
  custom: Record<string, any>
}
```

#### レスポンス（成功）
```typescript
{
  record: {
    id: string
    version: number              // 保存後の新しいバージョン
    ...
  }
}
```

#### レスポンス（409 Conflict）
```typescript
{
  error: "Record has been updated by another session"
}
```

### GET /api/case-records/list

#### クエリパラメータ
```
?serviceId=<UUID>&careReceiverId=<UUID>
```

#### レスポンス
```typescript
{
  records: [
    {
      id: string
      date: string
      main_staff_id: string
      version: number
      ...
    }
  ]
}
```

---

## 🎨 UI コンポーネント構成

### ページ全体
```
app/services/[serviceId]/users/[userId]/case-records/page.tsx
  ↓
src/components/case-records/CaseRecordFormClient.tsx (クライアントコンポーネント)
  ├── CaseRecordForm.tsx (フォームUI)
  ├── CaseRecordsListClient.tsx (一覧表示)
  └── AlertDialog (409 Conflict ダイアログ)
```

### 主要コンポーネント

#### CaseRecordFormClient
- **役割**: フォーム送信、API 呼び出し、状態管理
- **状態**:
  - `currentVersion`: 楽観ロック用バージョン
  - `currentRecordId`: 編集中のレコードID
  - `conflictDialogOpen`: 409 Conflict ダイアログ表示フラグ
  - `isSubmitting`: 送信中フラグ

#### CaseRecordForm
- **役割**: フォーム UI レンダリング
- **Props**:
  - `initial`: 初期値（日付、職員ID など）
  - `staffOptions`: 職員選択肢
  - `templateFields`: カスタムフィールド定義
  - `onSubmit`: 送信ハンドラ

#### CaseRecordsListClient
- **役割**: 保存済みケース記録の一覧表示
- **Props**:
  - `serviceId`: サービスID
  - `careReceiverId`: 利用者ID
  - `refreshKey`: 再読み込みトリガー

---

## ✅ バリデーション

### フロントエンドバリデーション（Zod）

```typescript
// src/lib/case-records/form-schemas.ts
export const CaseRecordFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  careReceiverName: z.string().min(1),
  serviceId: z.string().uuid(),
  mainStaffId: z.string().uuid().nullable(),
  subStaffId: z.string().uuid().nullable(),
  specialNotes: z.string(),
  familyNotes: z.string(),
  custom: z.record(z.any()),
})
```

### バックエンドバリデーション

```typescript
// app/api/case-records/save/route.ts
if (!body.careReceiverId || !body.serviceId || !body.date) {
  return NextResponse.json(
    { error: "Missing required fields" },
    { status: 400 }
  )
}
```

---

## 🧪 テスト手順

### 1. 新規作成テスト
```
1. ATさんのケース記録ページを開く
2. 日付選択: 今日の日付
3. 主担当スタッフ: 選択肢から選ぶ
4. 特記事項: "テスト記録" と入力
5. 保存ボタンをクリック
6. 期待動作: 保存成功トースト表示、一覧に新規記録が追加される
```

### 2. 更新テスト
```
1. 一覧から既存レコードを選択（編集モード）
2. 特記事項を変更
3. 保存ボタンをクリック
4. 期待動作: 保存成功、version が 1→2 に増加
```

### 3. 同時編集制御テスト
```
1. 同じレコードを2つのタブで開く
2. タブ1で編集・保存 → version: 2
3. タブ2で古い version: 1 のまま保存試行
4. 期待動作: 409 Conflict ダイアログ表示
5. "最新データを再読み込み" ボタンで更新
6. タブ2がリフレッシュされ、version: 2 のデータが表示される
```

### 4. カスタムフィールドテスト
```
1. ATさんのテンプレートにカスタムフィールドが定義されている
2. フォームに "呼吸補助" などのフィールドが表示される
3. 値を選択・入力して保存
4. 期待動作: custom フィールドに JSON として保存される
```

---

## 🚨 よくあるエラーと対処法

### エラー: "職員データが登録されていません"

**原因**: Supabase に職員データが存在しない

**対処法**:
1. Supabase Dashboard → Table Editor → `staff` テーブルを確認
2. 職員データを手動追加、または `/api/staff` API で登録

---

### エラー: "他の端末で更新されています"（常に表示される）

**原因**: `version` トリガーが正しく動作していない

**対処法**:
```sql
-- Supabase SQL Editor で実行
SELECT id, version, updated_at FROM case_records ORDER BY updated_at DESC LIMIT 10;

-- version が更新されていない場合、トリガーを再作成
-- supabase/migrations/20260128093212_add_version_to_case_records.sql を再実行
```

---

### エラー: "カスタムフィールドが表示されない"

**原因**: テンプレートが正しく取得できていない

**対処法**:
1. `getCareReceiverTemplate()` の戻り値をログ出力
2. `template?.customFields` が空配列でないか確認
3. Supabase の `care_receivers` テーブルで `custom_template` カラムを確認

---

## 📚 関連ドキュメント

- **楽観ロック設計**: `docs/CONCURRENCY.md`
- **API 実装例**: `app/api/case-records/save/route.ts`
- **フロント実装**: `src/components/case-records/CaseRecordFormClient.tsx`
- **テンプレート構造**: `docs/case-records-template-structure.md`

---

## 🔄 今後の拡張予定

### Phase 2（予定）
- [ ] 編集履歴機能（audit log）
- [ ] PDF エクスポート（月次レポート）
- [ ] オフライン対応（IndexedDB + 同期）

### Phase 3（予定）
- [ ] AI による記録提案（Vercel AI SDK）
- [ ] 音声入力対応（Whisper API）
- [ ] 画像添付機能（Vercel Blob）

---

**最終更新**: 2026年1月28日  
**完成形リファレンス**: `/services/life-care/users/AT/case-records`  
**次回更新タイミング**: ATさんのテンプレート変更時、または新機能追加時
