# ケース記録機�E�E�仕様書

> **📌 対象読老E*: ケース記録機�Eを実裁E�E修正する開発老E 
> **前提**: `docs/PLAN_MASTER.md` を�Eに読んでぁE��こと  
> **関連**: `docs/PLAN_PERSONAL_INFO_SECURITY.md`�E�個人惁E��管琁E��E 
> **完�E形リファレンス**: ATさんのペ�Eジ (`/services/life-care/users/AT/case-records`)

---

## 🎯 ケース記録機�Eの目皁E
医療�E介護現場で、スタチE��が利用老E��重痁E��E��障がぁE�E老E���E日、E�Eケア冁E��を記録するための機�E、E
### 主な用送E- 日ごとのケア実施記録�E�主拁E���E副拁E��スタチE��、日付、�E容�E�E- カスタムフィールド（利用老E��との個別記録頁E���E�E- 家族への特記事頁E��スタチE��間�E引き継ぎ事頁E
### 重要なセキュリチE��要件
- **同時編雁E��御**: 褁E��スタチE��が同じ記録を編雁E��ても上書きされなぁE��楽観ロチE���E�E- **RLS�E�Eow Level Security�E�E*: Supabase で利用老E��と・職員ごとにアクセス制御
- **個人惁E��管琁E*: ケース記録に利用老E�E個人惁E��を含めなぁE��Eisplay_name で表示�E�E- **バリチE�Eション**: 忁E��フィールドチェチE��、日付形式検証

---

## 🔗 個人惁E��との連携

### 利用老E��報の参�E方況E
ケース記録フォームで利用老E��選択する際、以下�Eように個人惁E��と匿名表示を使ぁE�Eけます、E
```
┌─ ケース記録フォーム ────────────────────────━E━E 利用老E��抁E [AT ▼]                          ━E ↁEdisplay_name を表示
━E                                            ━E━E 記録冁E��                                    ━E━E ━E主拁E��スタチE��: [Aさん ▼]                ━E━E ━E副拁E��スタチE��: [Bさん ▼]                ━E━E ━E特記事頁E [フリー入力]                   ━E━E                                            ━E━E [保存]                                      ━E└─────────────────────────────────────────────━E
※ 実名�E�Eull_name�E��E、ケース記録フォームに
  表示しなぁE��利用老E�E個人惁E��保護�E�E```

### API からのチE�Eタ取征E
ケース記録保存時の API リクエスト�E、以下�E惁E��のみを送信します、E
```typescript
{
  date: "2026-01-28",
  care_receiver_id: "uuid-of-AT",  // ID で識別
  // �E�注�E�full_name, address, phone などは含めなぁE  main_staff_id: "uuid-of-staff-A",
  sub_staff_id: "uuid-of-staff-B",
  special_notes: "...",
  custom: { ... }
}
```

### 利用老E��細ペ�Eジとの関連

- `display_name`: ケース記録フォームで使用�E�常時表示�E�E- `full_name`, `birthday`: 利用老E��細ペ�Eジの「詳細惁E��を編雁E��ダイアログのみで表示
- `medical_care_detail`: 個別の編雁E��イアログで管琁E��ケース記録には含めなぁE��E
詳細: [PLAN_PERSONAL_INFO_SECURITY.md](./PLAN_PERSONAL_INFO_SECURITY.md) を参照

---

## 📋 ATさん = 完�E形リファレンス

**ATさんとは**: 開発・チE��ト用の利用老E��カウント！EserId: "AT"�E�E
### ATさんのペ�Eジ構�E

| URL | 説昁E|
|-----|------|
| `/services/life-care/users/AT` | ATさんのプロフィールペ�Eジ |
| `/services/life-care/users/AT/case-records` | ATさんのケース記録ペ�Eジ�E�E*完�E形**�E�E|

### ATさんのケース記録で実裁E��み機�E

1. **フォーム UI**
   - 日付選択！EatePicker�E�E   - 主拁E��スタチE��選択（ドロチE�Eダウン�E�E   - 副拁E��スタチE��選択（ドロチE�Eダウン�E�E   - 特記事頁E��テキストエリア�E�E   - 家族への連絡事頁E��テキストエリア�E�E   - カスタムフィールド（テンプレート�Eース�E�E
2. **チE�Eタ保孁E*
   - `/api/case-records/save` API に POST
   - `version` パラメータで楽観ロチE��
   - 保存�E功時に一覧リフレチE��ュ

3. **同時編雁E��御**
   - 409 Conflict 時にダイアログ表示
   - 「最新チE�Eタを�E読み込み」�Eタン

4. **一覧表示**
   - 保存済みケース記録の一覧表示�E�EaseRecordsListClient�E�E   - 日付降頁E��ソーチE
---

## 🗂�E�EチE�Eタ構造

### case_records チE�Eブル�E�Eupabase�E�E
| カラム吁E| 垁E| 説昁E| 忁E��E|
|---------|---|------|------|
| `id` | UUID | レコードID�E�主キー�E�E| ✁E|
| `care_receiver_id` | UUID | 利用老ED�E�外部キー�E�E| ✁E|
| `service_id` | UUID | サービスID�E�外部キー�E�E| ✁E|
| `date` | DATE | 記録日仁E| ✁E|
| `main_staff_id` | UUID | 主拁E��スタチE��ID | ✁E|
| `sub_staff_id` | UUID | 副拁E��スタチE��ID | ❁E|
| `special_notes` | TEXT | 特記事頁E| ❁E|
| `family_notes` | TEXT | 家族への連絡事頁E| ❁E|
| `custom` | JSONB | カスタムフィールド（テンプレート！E| ❁E|
| `version` | INTEGER | 楽観ロチE��用バ�Eジョン | ✁E|
| `created_at` | TIMESTAMP | 作�E日晁E| ✁E|
| `updated_at` | TIMESTAMP | 更新日晁E| ✁E|

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
  custom: Record<string, any>     // カスタムフィールチE}

// API レスポンス垁Eexport type CaseRecordResponse = {
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
    version: number                // 楽観ロチE��用
    created_at: string
    updated_at: string
  }
}
```

---

## 🔐 楽観ロチE���E�同時編雁E��御�E�E
### 仕絁E��

1. **フォーム読み込み晁E*: 既存レコード�E `version` を取征E2. **保存時**: `version` めEAPI リクエストに含める
3. **API 側チェチE��**: 
   ```sql
   UPDATE case_records 
   SET ... 
   WHERE id = $1 AND version = $2  -- バ�Eジョンが一致するレコード�Eみ更新
   ```
4. **競合検�E**: 更新件数ぁE0 件 ↁE409 Conflict を返却
5. **フロント�E琁E*: 409 受信時にダイアログ表示

### 実裁E��ァイル

| ファイル | 説昁E|
|---------|------|
| `supabase/migrations/20260128093212_add_version_to_case_records.sql` | `version` カラム追加 + トリガー |
| `app/api/case-records/save/route.ts` | 保存API�E�E09 Conflict 対応！E|
| `src/components/case-records/CaseRecordFormClient.tsx` | フロント（ダイアログ表示�E�E|

詳細設訁E `docs/CONCURRENCY.md` 参�E

---

## 📄 カスタムフィールド（テンプレート！E
### チE��プレートとは

利用老E��とに異なる記録頁E��を定義できる仕絁E��、E
**侁E ATさんのカスタムフィールチE*
```json
{
  "customFields": [
    {
      "id": "breathing_support",
      "label": "呼吸補助",
      "type": "select",
      "options": ["不要E, "酸素吸入", "人工呼吸器"]
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

### チE��プレート取征E
```typescript
// app/services/[serviceId]/users/[userId]/case-records/page.tsx
const template = await getCareReceiverTemplate(careReceiverUuid)

// template.customFields めECaseRecordForm に渡ぁE<CaseRecordForm
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

## 🔧 API エンド�EインチE
### POST /api/case-records/save

#### リクエスチE```typescript
{
  recordId?: string              // 既存レコード更新時�Eみ
  version?: number               // 楽観ロチE��用�E�既存レコード更新時�Eみ�E�E  careReceiverId: string         // UUID
  serviceId: string              // UUID
  date: string                   // YYYY-MM-DD
  mainStaffId: string            // UUID
  subStaffId: string | null      // UUID
  specialNotes: string
  familyNotes: string
  custom: Record<string, any>
}
```

#### レスポンス�E��E功！E```typescript
{
  record: {
    id: string
    version: number              // 保存後�E新しいバ�Eジョン
    ...
  }
}
```

#### レスポンス�E�E09 Conflict�E�E```typescript
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

## 🎨 UI コンポ�Eネント構�E

### ペ�Eジ全佁E```
app/services/[serviceId]/users/[userId]/case-records/page.tsx
  ↁEsrc/components/case-records/CaseRecordFormClient.tsx (クライアントコンポ�EネンチE
  ├── CaseRecordForm.tsx (フォームUI)
  ├── CaseRecordsListClient.tsx (一覧表示)
  └── AlertDialog (409 Conflict ダイアログ)
```

### 主要コンポ�EネンチE
#### CaseRecordFormClient
- **役割**: フォーム送信、API 呼び出し、状態管琁E- **状慁E*:
  - `currentVersion`: 楽観ロチE��用バ�Eジョン
  - `currentRecordId`: 編雁E��のレコードID
  - `conflictDialogOpen`: 409 Conflict ダイアログ表示フラグ
  - `isSubmitting`: 送信中フラグ

#### CaseRecordForm
- **役割**: フォーム UI レンダリング
- **Props**:
  - `initial`: 初期値�E�日付、�E員ID など�E�E  - `staffOptions`: 職員選択肢
  - `templateFields`: カスタムフィールド定義
  - `onSubmit`: 送信ハンドラ

#### CaseRecordsListClient
- **役割**: 保存済みケース記録の一覧表示
- **Props**:
  - `serviceId`: サービスID
  - `careReceiverId`: 利用老ED
  - `refreshKey`: 再読み込みトリガー

---

## ✁EバリチE�Eション

### フロントエンドバリチE�Eション�E�Eod�E�E
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

### バックエンドバリチE�Eション

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

## 🧪 チE��ト手頁E
### 1. 新規作�EチE��チE```
1. ATさんのケース記録ペ�Eジを開ぁE2. 日付選抁E 今日の日仁E3. 主拁E��スタチE��: 選択肢から選ぶ
4. 特記事頁E "チE��ト記録" と入劁E5. 保存�EタンをクリチE��
6. 期征E��佁E 保存�E功トースト表示、一覧に新規記録が追加されめE```

### 2. 更新チE��チE```
1. 一覧から既存レコードを選択（編雁E��ード！E2. 特記事頁E��変更
3. 保存�EタンをクリチE��
4. 期征E��佁E 保存�E功、version ぁE1ↁE に増加
```

### 3. 同時編雁E��御チE��チE```
1. 同じレコードを2つのタブで開く
2. タチEで編雁E�E保孁EↁEversion: 2
3. タチEで古ぁEversion: 1 のまま保存試衁E4. 期征E��佁E 409 Conflict ダイアログ表示
5. "最新チE�Eタを�E読み込み" ボタンで更新
6. タチEがリフレチE��ュされ、version: 2 のチE�Eタが表示されめE```

### 4. カスタムフィールドテスチE```
1. ATさんのチE��プレートにカスタムフィールドが定義されてぁE��
2. フォームに "呼吸補助" などのフィールドが表示されめE3. 値を選択�E入力して保孁E4. 期征E��佁E custom フィールドに JSON として保存される
```

---

## 🚨 よくあるエラーと対処況E
### エラー: "職員チE�Eタが登録されてぁE��せん"

**原因**: Supabase に職員チE�Eタが存在しなぁE
**対処況E*:
1. Supabase Dashboard ↁETable Editor ↁE`staff` チE�Eブルを確誁E2. 職員チE�Eタを手動追加、また�E `/api/staff` API で登録

---

### エラー: "他�E端末で更新されてぁE��ぁE�E�常に表示される！E
**原因**: `version` トリガーが正しく動作してぁE��ぁE
**対処況E*:
```sql
-- Supabase SQL Editor で実衁ESELECT id, version, updated_at FROM case_records ORDER BY updated_at DESC LIMIT 10;

-- version が更新されてぁE��ぁE��合、トリガーを�E作�E
-- supabase/migrations/20260128093212_add_version_to_case_records.sql を�E実衁E```

---

### エラー: "カスタムフィールドが表示されなぁE

**原因**: チE��プレートが正しく取得できてぁE��ぁE
**対処況E*:
1. `getCareReceiverTemplate()` の戻り値をログ出劁E2. `template?.customFields` が空配�EでなぁE��確誁E3. Supabase の `care_receivers` チE�Eブルで `custom_template` カラムを確誁E
---

## 📚 関連ドキュメンチE
- **楽観ロチE��設訁E*: `docs/CONCURRENCY.md`
- **API 実裁E��E*: `app/api/case-records/save/route.ts`
- **フロント実裁E*: `src/components/case-records/CaseRecordFormClient.tsx`
- **チE��プレート構造**: `docs/case-records-template-structure.md`

---

## 🔄 今後�E拡張予宁E
### Phase 2�E�予定！E- [ ] 編雁E��歴機�E�E�Eudit log�E�E- [ ] PDF エクスポ�Eト（月次レポ�Eト！E- [ ] オフライン対応！EndexedDB + 同期�E�E
### Phase 3�E�予定！E- [ ] AI による記録提案！Eercel AI SDK�E�E- [ ] 音声入力対応！Ehisper API�E�E- [ ] 画像添付機�E�E�Eercel Blob�E�E
---

**最終更新**: 2026年1朁E8日  
**完�E形リファレンス**: `/services/life-care/users/AT/case-records`  
**次回更新タイミング**: ATさんのチE��プレート変更時、また�E新機�E追加晁E
