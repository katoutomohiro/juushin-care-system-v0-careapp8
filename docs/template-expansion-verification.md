# チE��プレート横展開機�E 検証手頁E
## 目皁EATさん専用チE��プレートを他利用老E��も適用できる構造が正しく機�Eするか検証する、E
## 追加した冁E��

### 1. チE��トユーザー定義
**ユーザーID**: `TEST_USER_01`  
**表示吁E*: TEST_USER_01  
**フィールド数**: 3倁E
#### フィールド構�E
1. **姿勢** (select)
   - 座佁E/ 立佁E/ 臥佁E2. **緊張度** (select)
   - リラチE��ス / 普送E/ 緊張
3. **反忁E* (textarea)
   - 自由記述

### 2. 実裁E��ァイル
- **`lib/templates/test-user-template.ts`** (新規作�E)
- **`lib/templates/field-config.ts`** (case "TESTUSER01" 追加)
- **`app/services/[serviceId]/page.tsx`** (userDetails に追加)

## 検証手頁E
### Step 1: ビルド確誁E```powershell
pnpm lint
pnpm typecheck
pnpm build
```

すべてエラーなしで完亁E��ること、E
### Step 2: 開発サーバ�E起勁E```powershell
pnpm dev
```

### Step 3: ユーザー一覧確誁E```
http://dev-app.local:3000/services/life-care
```

**期征E��果**:
- ユーザーカード一覧に「TEST_USER_01」が表示されめE- カードをクリチE��すると `/services/life-care/users/TESTUSER01` に遷移

### Step 4: ケース記録フォーム確誁E```
http://dev-app.local:3000/services/life-care/users/TESTUSER01/case-records
```

**期征E��果**:
1. **ペ�Eジタイトル**: "ケース記録"
2. **ユーザー吁E*: TEST_USER_01
3. **共通フィールチE*:
   - 日付�E時刻
   - メインスタチE��
   - サブスタチE��
   - 特記事頁E   - 家族連絡
4. **TEST_USER_01専用フィールチE* (以丁Eつが表示されめE:
   - 姿勢 (ドロチE�Eダウン)
   - 緊張度 (ドロチE�Eダウン)
   - 反忁E(チE��ストエリア)

### Step 5: 保存テスチE
#### 5-1. フォーム入劁E- 日仁E 自動�E力済み
- 時刻: 自動�E力済み
- メインスタチE��: 「スタチE��A」を選抁E- 姿勢: 「座位」を選抁E- 緊張度: 「リラチE��ス」を選抁E- 反忁E 「声掛けに笑顔で応答」と入劁E
#### 5-2. 保存実衁E1. 「保存」�EタンをクリチE��
2. DevTools Network タブを確誁E
**期征E��クエスチE*:
```json
POST /api/case-records
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
      "test_response": "声掛けに笑顔で応筁E
    }
  }
}
```

**期征E��スポンス**:
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

#### 5-3. UI確誁E- 緑色のバナー「保存しました」が表示されめE- Toast通知「✅ ケース記録を保存しました」が表示されめE
### Step 6: ATさんの動作確認（退行テスト！E```
http://dev-app.local:3000/services/life-care/users/AT/case-records
```

**期征E��果**:
- ATさん専用の11個�Eフィールドが正しく表示されめE- TEST_USER_01のフィールド�E表示されなぁE- 保存が正常に動作すめE
### Step 7: Supabase確誁ESupabase Dashboard ↁE`case_records` チE�Eブル

**期征E��コーチE*:
```sql
SELECT * FROM case_records WHERE user_id = 'TESTUSER01';
```

| user_id | service_id | record_date | payload |
|---------|------------|-------------|---------|
| TESTUSER01 | life-care | 2026-01-08 | {"custom": {"test_posture": "sitting", ...}} |

## 確認頁E��チェチE��リスチE
### ビルチE- [x] `pnpm lint` エラーなぁE(2026-01-08 検証済み)
- [x] `pnpm typecheck` エラーなぁE(2026-01-08 検証済み)
- [x] `pnpm build` エラーなぁE(16.3s, 30 routes) (2026-01-08 検証済み)

### UI表示
- [ ] ユーザー一覧に TEST_USER_01 が表示されめE- [ ] ケース記録ペ�Eジが正常に表示されめE- [ ] 3つの専用フィールドが表示されめE- [ ] 共通フィールド（日付�EスタチE��など�E�も表示されめE
### 保存機�E
- [ ] 保存�EタンをクリチE��できる
- [ ] Network に POST リクエストが出めE- [ ] レスポンスぁE200 OK
- [ ] 「保存しました」バナ�Eが表示されめE- [ ] Toast通知が表示されめE
### チE�Eタ確誁E- [ ] Supabase に TESTUSER01 のレコードが作�EされめE- [ ] payload.custom に test_* フィールドが保存される

### 退行テスチE- [ ] ATさんのフォームが正常に動作すめE- [ ] ATさん専用の11フィールドが表示されめE- [ ] ATさんの保存が正常に動作すめE
## トラブルシューチE��ング

### エラー: チE��プレートが見つかりません
**原因**: normalizeUserId で "TEST_USER_01" ↁE"TESTUSER01" に正規化されめE
**解決筁E*: field-config.ts の case は `"TESTUSER01"` (アンダースコア除去征E

### エラー: フィールドが表示されなぁE**原因**: require() でモジュールが読み込めてぁE��ぁE
**解決筁E*:
1. `lib/templates/test-user-template.ts` のパスを確誁E2. export 名が `TEST_USER_01_TEMPLATE_FIELDS` であることを確誁E
### エラー: 保存できなぁE**原因**: API やSupabaseの設宁E
**解決筁E*:
1. `.env.local` の環墁E��数を確誁E2. Supabase チE�Eブルが作�EされてぁE��か確誁E3. Console でエラーログを確誁E
## 成功時�E期征E��佁E
### フロー全佁E```
1. TEST_USER_01 カードをクリチE��
   ↁE2. ケース記録ペ�Eジ表示
   ↁE3. 3つの専用フィールチE+ 共通フィールドが表示
   ↁE4. フォーム入劁E   ↁE5. 保存クリチE��
   ↁE6. POST /api/case-records (payload.custom に test_* 含む)
   ↁE7. 200 OK + 「保存しました」表示
   ↁE8. Supabase に TESTUSER01 レコード作�E
```

### 確認完亁E��ETEST_USER_01 は検証専用のため、忁E��に応じて削除可能�E�E1. `app/services/[serviceId]/page.tsx` から userDetails エントリ削除
2. `lib/templates/field-config.ts` から case "TESTUSER01" 削除
3. `lib/templates/test-user-template.ts` 削除

## 結諁E
こ�E検証により、以下が確認できます！E
1. ✁E**横展開可能**: ATさん以外�E利用老E��も同じ仕絁E��でチE��プレートを適用できる
2. ✁E**独立性**: ATさんと TEST_USER_01 のフィールド�E互いに干渉しなぁE3. ✁E**拡張性**: 新しい利用老E��追加する手頁E��明確�E�EスチE��プ！E4. ✁E**既存保持**: ATさんの既存機�Eは一刁E��響を受けなぁE5. ✁E**チE�Eタ互換**: payload構造は統一されており、Supabase スキーマ変更不要E
