# ケース記録保存機能 動作確認手順

## 前提条件

### 1. 環境変数設定 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabaseテーブル作成
`supabase/migrations/20260108_create_case_records.sql` を実行済みであること

---

## 動作確認手順

### Step 1: 開発サーバー起動
```powershell
pnpm dev
```

### Step 2: ブラウザでケース記録ページを開く
```
http://localhost:3000/services/life-care/users/AT/case-records
```

### Step 3: DevTools を開く
- F12 キーで開発者ツールを表示
- **Network** タブを選択
- **Fetch/XHR** フィルターを有効化

### Step 4: フォームに入力
1. 日付・時刻は自動入力されている（確認）
2. メインスタッフ: 「スタッフA」を選択
3. サブスタッフ: 「スタッフB」を選択
4. 特記事項に何か入力: 例「テスト記録」
5. ATテンプレートのカスタムフィールドに入力:
   - ストレッチ・マッサージ: 「10分実施」
   - 課題①: 「着座訓練」など

### Step 5: 保存ボタンをクリック
1. **「保存」** ボタンをクリック
2. ボタンが **「保存中...」** に変わり、disabled になることを確認
3. Network タブで以下を確認:

#### ✅ 確認ポイント1: リクエスト送信
- **Name**: `case-records`
- **Method**: `POST`
- **Status**: `200` (成功)
- **Type**: `fetch`

#### ✅ 確認ポイント2: リクエスト内容
Request Payload (Preview タブ):
```json
{
  "userId": "AT",
  "serviceId": "life-care",
  "recordDate": "2026-01-08",
  "recordTime": "14:30",
  "mainStaffId": "staff-1",
  "subStaffIds": ["staff-2"],
  "payload": {
    "specialNotes": "テスト記録",
    "familyNotes": "",
    "custom": {
      "stretch_massage": "10分実施",
      "task_1": "着座訓練"
    }
  }
}
```

#### ✅ 確認ポイント3: レスポンス内容
Response (Preview タブ):
```json
{
  "ok": true,
  "record": {
    "id": "uuid-here",
    "user_id": "AT",
    "service_id": "life-care",
    "record_date": "2026-01-08",
    "record_time": "14:30:00",
    "payload": { ... },
    "created_at": "2026-01-08T05:30:00Z",
    "updated_at": "2026-01-08T05:30:00Z"
  }
}
```

### Step 6: UI確認
1. **Toast通知** が画面右上（または設定された位置）に表示される:
   - タイトル: "✅ ケース記録を保存しました"
   - 説明: "AT の記録が正常に保存されました (14:30:45)"

2. **最終保存バナー** がフォーム上部に表示される:
   ```
   ✅ 最終保存: 2026/1/8 14:30:45
   ```

3. 保存ボタンが **「保存」** に戻り、再度クリック可能になる

### Step 7: Supabase確認
1. Supabase Dashboard にログイン
2. **Table Editor** → `case_records` を開く
3. 以下のレコードが存在することを確認:

| id | user_id | service_id | record_date | record_time | payload | created_at | updated_at |
|----|---------|------------|-------------|-------------|---------|------------|------------|
| (uuid) | AT | life-care | 2026-01-08 | 14:30:00 | {...} | 2026-01-08 05:30:00+00 | 2026-01-08 05:30:00+00 |

### Step 8: 更新テスト（同じ日付で再保存）
1. フォームの内容を変更（例: 特記事項を「更新テスト」に変更）
2. もう一度 **「保存」** をクリック
3. Network タブで `POST /api/case-records/save` が `200` を返すことを確認
4. Supabase で同じレコードが **UPDATE** されていることを確認:
   - `updated_at` が新しくなっている
   - `payload` の内容が更新されている

---

## エラーケースの確認

### Case 1: Supabase接続エラー
**シミュレーション**: `.env.local` の `SUPABASE_SERVICE_ROLE_KEY` を一時的に無効な値にする

**期待結果**:
- Network: `500 Internal Server Error`
- Response: `{ "ok": false, "error": "Server configuration error" }`
- Toast: 「❌ 保存に失敗しました」

### Case 2: 必須フィールド欠損
**シミュレーション**: DevTools Console で実行
```javascript
fetch('/api/case-records/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ serviceId: 'life-care' }) // userId欠損
}).then(r => r.json()).then(console.log)
```

**期待結果**:
- Network: `400 Bad Request`
- Response: `{ "ok": false, "error": "Missing required fields: userId, serviceId, recordDate" }`

---

## トラブルシューティング

### 問題: 保存ボタンを押しても何も起きない
**原因**: 
- フォームの `onSubmit` が呼ばれていない
- `handleSubmit` が例外で止まっている

**解決策**:
1. Console タブでエラーを確認
2. `[CaseRecordFormClient] Submitting:` ログが出ているか確認
3. Network タブで fetch リクエストが出ているか確認

### 問題: 500エラーが返る
**原因**:
- Supabase環境変数が設定されていない
- Supabaseテーブルが作成されていない

**解決策**:
1. `.env.local` の環境変数を確認
2. `pnpm dev` を再起動
3. Supabaseでテーブル作成SQLを実行

### 問題: 400エラーが返る
**原因**:
- リクエストボディに必須フィールドが含まれていない
- 日付フォーマットが不正

**解決策**:
1. Network → Payload を確認
2. `userId`, `serviceId`, `recordDate` が含まれているか確認
3. Console で `[CaseRecordFormClient] Submitting:` の内容を確認

---

## 成功時のログ出力例

### Console
```
[CaseRecordFormClient] Submitting: {
  date: "2026-01-08",
  time: "14:30",
  userId: "AT",
  serviceId: "life-care",
  mainStaffId: "staff-1",
  subStaffIds: ["staff-2"],
  specialNotes: "テスト記録",
  familyNotes: "",
  custom: { stretch_massage: "10分実施" }
}

[case-records API] Upserting record: {
  user_id: "AT",
  service_id: "life-care",
  record_date: "2026-01-08"
}

[case-records API] Success: {
  id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  user_id: "AT",
  ...
}

[CaseRecordFormClient] Saved: {
  id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  ...
}
```

---

## チェックリスト

- [ ] `.env.local` に Supabase環境変数を設定
- [ ] Supabaseテーブル `case_records` を作成
- [ ] `pnpm dev` で開発サーバー起動
- [ ] `/services/life-care/users/AT/case-records` にアクセス
- [ ] DevTools Network タブを開く
- [ ] フォームに入力して「保存」をクリック
- [ ] `POST /api/case-records/save` が `200` を返す
- [ ] Toast通知「✅ ケース記録を保存しました」が表示される
- [ ] 「最終保存」バナーが表示される
- [ ] Supabase `case_records` テーブルにレコードが作成される
- [ ] 同じ日付で再保存すると `updated_at` が更新される
