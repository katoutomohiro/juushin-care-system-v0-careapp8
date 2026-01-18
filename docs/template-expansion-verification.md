# テンプレート横展開機能 検証手順

## 目的
ATさん専用テンプレートを他利用者にも適用できる構造が正しく機能するか検証する。

## 追加した内容

### 1. テストユーザー定義
**ユーザーID**: `TEST_USER_01`  
**表示名**: TEST_USER_01  
**フィールド数**: 3個

#### フィールド構成
1. **姿勢** (select)
   - 座位 / 立位 / 臥位
2. **緊張度** (select)
   - リラックス / 普通 / 緊張
3. **反応** (textarea)
   - 自由記述

### 2. 実装ファイル
- **`lib/templates/test-user-template.ts`** (新規作成)
- **`lib/templates/field-config.ts`** (case "TESTUSER01" 追加)
- **`app/services/[serviceId]/page.tsx`** (userDetails に追加)

## 検証手順

### Step 1: ビルド確認
```powershell
pnpm lint
pnpm typecheck
pnpm build
```

すべてエラーなしで完了すること。

### Step 2: 開発サーバー起動
```powershell
pnpm dev
```

### Step 3: ユーザー一覧確認
```
http://localhost:3000/services/life-care
```

**期待結果**:
- ユーザーカード一覧に「TEST_USER_01」が表示される
- カードをクリックすると `/services/life-care/users/TESTUSER01` に遷移

### Step 4: ケース記録フォーム確認
```
http://localhost:3000/services/life-care/users/TESTUSER01/case-records
```

**期待結果**:
1. **ページタイトル**: "ケース記録"
2. **ユーザー名**: TEST_USER_01
3. **共通フィールド**:
   - 日付・時刻
   - メインスタッフ
   - サブスタッフ
   - 特記事項
   - 家族連絡
4. **TEST_USER_01専用フィールド** (以下3つが表示される):
   - 姿勢 (ドロップダウン)
   - 緊張度 (ドロップダウン)
   - 反応 (テキストエリア)

### Step 5: 保存テスト

#### 5-1. フォーム入力
- 日付: 自動入力済み
- 時刻: 自動入力済み
- メインスタッフ: 「スタッフA」を選択
- 姿勢: 「座位」を選択
- 緊張度: 「リラックス」を選択
- 反応: 「声掛けに笑顔で応答」と入力

#### 5-2. 保存実行
1. 「保存」ボタンをクリック
2. DevTools Network タブを確認

**期待リクエスト**:
```json
<<<<<<< HEAD
POST /api/case-records/save
=======
POST /api/case-records
>>>>>>> origin/main
{
  "userId": "TESTUSER01",
  "serviceId": "life-care",
  "recordDate": "2026-01-08",
  "recordTime": "14:30",
  "mainStaffId": "staff-1",
  "subStaffIds": [],
  "payload": {
    "specialNotes": "",
    "familyNotes": "",
    "custom": {
      "test_posture": "sitting",
      "test_tension": "relaxed",
      "test_response": "声掛けに笑顔で応答"
    }
  }
}
```

**期待レスポンス**:
```json
{
  "ok": true,
  "record": {
    "id": "uuid...",
    "user_id": "TESTUSER01",
    "service_id": "life-care",
    "record_date": "2026-01-08",
    "payload": { ... }
  }
}
```

#### 5-3. UI確認
- 緑色のバナー「保存しました」が表示される
- Toast通知「✅ ケース記録を保存しました」が表示される

### Step 6: ATさんの動作確認（退行テスト）
```
http://localhost:3000/services/life-care/users/AT/case-records
```

**期待結果**:
- ATさん専用の11個のフィールドが正しく表示される
- TEST_USER_01のフィールドは表示されない
- 保存が正常に動作する

### Step 7: Supabase確認
Supabase Dashboard → `case_records` テーブル

**期待レコード**:
```sql
SELECT * FROM case_records WHERE user_id = 'TESTUSER01';
```

| user_id | service_id | record_date | payload |
|---------|------------|-------------|---------|
| TESTUSER01 | life-care | 2026-01-08 | {"custom": {"test_posture": "sitting", ...}} |

## 確認項目チェックリスト

### ビルド
- [x] `pnpm lint` エラーなし (2026-01-08 検証済み)
- [x] `pnpm typecheck` エラーなし (2026-01-08 検証済み)
- [x] `pnpm build` エラーなし (16.3s, 30 routes) (2026-01-08 検証済み)

### UI表示
- [ ] ユーザー一覧に TEST_USER_01 が表示される
- [ ] ケース記録ページが正常に表示される
- [ ] 3つの専用フィールドが表示される
- [ ] 共通フィールド（日付・スタッフなど）も表示される

### 保存機能
- [ ] 保存ボタンをクリックできる
- [ ] Network に POST リクエストが出る
- [ ] レスポンスが 200 OK
- [ ] 「保存しました」バナーが表示される
- [ ] Toast通知が表示される

### データ確認
- [ ] Supabase に TESTUSER01 のレコードが作成される
- [ ] payload.custom に test_* フィールドが保存される

### 退行テスト
- [ ] ATさんのフォームが正常に動作する
- [ ] ATさん専用の11フィールドが表示される
- [ ] ATさんの保存が正常に動作する

## トラブルシューティング

### エラー: テンプレートが見つかりません
**原因**: normalizeUserId で "TEST_USER_01" → "TESTUSER01" に正規化される

**解決策**: field-config.ts の case は `"TESTUSER01"` (アンダースコア除去後)

### エラー: フィールドが表示されない
**原因**: require() でモジュールが読み込めていない

**解決策**:
1. `lib/templates/test-user-template.ts` のパスを確認
2. export 名が `TEST_USER_01_TEMPLATE_FIELDS` であることを確認

### エラー: 保存できない
**原因**: API やSupabaseの設定

**解決策**:
1. `.env.local` の環境変数を確認
2. Supabase テーブルが作成されているか確認
3. Console でエラーログを確認

## 成功時の期待動作

### フロー全体
```
1. TEST_USER_01 カードをクリック
   ↓
2. ケース記録ページ表示
   ↓
3. 3つの専用フィールド + 共通フィールドが表示
   ↓
4. フォーム入力
   ↓
5. 保存クリック
   ↓
<<<<<<< HEAD
6. POST /api/case-records/save (payload.custom に test_* 含む)
=======
6. POST /api/case-records (payload.custom に test_* 含む)
>>>>>>> origin/main
   ↓
7. 200 OK + 「保存しました」表示
   ↓
8. Supabase に TESTUSER01 レコード作成
```

### 確認完了後
TEST_USER_01 は検証専用のため、必要に応じて削除可能：
1. `app/services/[serviceId]/page.tsx` から userDetails エントリ削除
2. `lib/templates/field-config.ts` から case "TESTUSER01" 削除
3. `lib/templates/test-user-template.ts` 削除

## 結論

この検証により、以下が確認できます：

1. ✅ **横展開可能**: ATさん以外の利用者にも同じ仕組みでテンプレートを適用できる
2. ✅ **独立性**: ATさんと TEST_USER_01 のフィールドは互いに干渉しない
3. ✅ **拡張性**: 新しい利用者を追加する手順が明確（3ステップ）
4. ✅ **既存保持**: ATさんの既存機能は一切影響を受けない
5. ✅ **データ互換**: payload構造は統一されており、Supabase スキーマ変更不要
