# 利用者情報編集機能 - テスト手順

> **目的**: 利用者情報編集機能（個人情報 + 医療的ケア + 楽観ロック + 監査ログ）の動作確認  
> **対象**: ローカル開発環境 + Vercel 本番環境  
> **重要**: 個人情報保護ポリシーに従い、開発環境では匿名データのみ使用

---

## 前提条件

### ローカル環境
- Supabase ローカル環境が起動していること（`npx supabase start`）
- migration が適用済みであること（`npx supabase db reset` または `npx supabase db push`）
- 開発サーバーが起動していること（`pnpm dev`）

### 本番環境
- Vercel にデプロイ済みであること
- Supabase 本番環境に migration が適用済みであること
- 環境変数が正しく設定されていること（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）

---

## テストシナリオ

### 1. 個人情報編集の基本動作（ローカル）

#### 手順
1. ブラウザで `http://localhost:3000` を開く
2. ログイン画面で認証（Supabase Auth または匿名アクセス）
3. `http://localhost:3000/services/life-care/users/AT` を開く（利用者詳細ページ）
4. "🔒 詳細情報を編集" ボタンをクリック
5. ダイアログが開くことを確認

#### 確認項目
- [ ] ダイアログが正しく表示される
- [ ] 既存の `display_name` が表示される（例: "AT"）
- [ ] 個人情報フィールドが空欄で表示される（開発環境では未入力）
- [ ] 医療的ケアチェックボックスが表示される（経管栄養、吸引、酸素吸入、人工呼吸器、発作対応）

#### 期待結果
✅ ダイアログが開き、フォームフィールドが正しく表示される

---

### 2. 匿名データでの保存（開発環境）

#### 手順
1. 上記ダイアログで以下を入力:
   - `display_name`: "テスト利用者A"（匿名）
   - `full_name`: **空欄のまま**（開発環境では実名を入れない）
   - `birthday`: "2000-01-01"
   - `gender`: "male"
   - `medical_care_detail.tube_feeding`: チェック
   - `medical_care_detail.tube_feeding_detail`: "経鼻経管栄養"
2. "保存" ボタンをクリック
3. トースト通知が表示されることを確認

#### 確認項目
- [ ] トースト通知が "利用者情報を更新しました" と表示される
- [ ] ページがリフレッシュされ、表示名が "テスト利用者A" に更新される
- [ ] ブラウザの Developer Tools → Network タブで `/api/care-receivers/AT` の PUT リクエストを確認
- [ ] Response body に `version` が含まれている

#### 期待結果
✅ データが正常に保存され、ページが更新される

---

### 3. ログ出力禁止の確認

#### 手順
1. ブラウザの Developer Tools → Console タブを開く
2. 利用者情報編集ダイアログを開く
3. "保存" ボタンをクリック
4. Console に `full_name`, `address`, `phone`, `emergency_contact` などが出力されていないことを確認

#### 確認項目
- [ ] Console に個人情報が出力されていない
- [ ] Network タブの Response Preview で `full_name` などが含まれている（API レスポンスには含まれる）
- [ ] Console ログには `sanitizedResponse` のみが出力されている（個人情報を除外）

#### 期待結果
✅ ログに個人情報が出力されず、サニタイズされたレスポンスのみが表示される

---

### 4. RLS による個人情報保護（Supabase SQL Editor）

#### 手順
1. Supabase Dashboard → SQL Editor を開く
2. 以下の SQL を実行:
   ```sql
   SET ROLE anon;  -- 認証前のユーザーロール
   SELECT full_name, address, phone FROM care_receivers WHERE code = 'AT';
   ```
3. 実行結果を確認

#### 確認項目
- [ ] 0件返却される（RLS で拒否される）
- [ ] エラーメッセージが表示される（例: "permission denied for table care_receivers"）

#### 期待結果
✅ RLS ポリシーが正しく動作し、anon ロールから個人情報にアクセスできない

---

### 5. 楽観ロック - 同時編集の検出（2ブラウザ）

#### 手順
1. **ブラウザA**: `http://localhost:3000/services/life-care/users/AT` を開く
2. **ブラウザB**: 同じ URL を別のブラウザ（または Incognito モード）で開く
3. **ブラウザA**: "🔒 詳細情報を編集" → `display_name` を "テスト利用者B" に変更 → "保存"
4. **ブラウザB**: "🔒 詳細情報を編集" → `display_name` を "テスト利用者C" に変更 → "保存"

#### 確認項目
- [ ] ブラウザA の保存は成功する（トースト通知表示）
- [ ] ブラウザB の保存は失敗する（409 Conflict）
- [ ] ブラウザB で AlertDialog が表示される: "⚠️ 他のユーザーが先に更新しています"
- [ ] "最新データを再読み込み" ボタンをクリックすると、ブラウザB のフォームが最新データ（"テスト利用者B"）に更新される

#### 期待結果
✅ 楽観ロックが正しく動作し、競合が検出される

---

### 6. 監査ログの確認（Supabase Table Editor）

#### 手順
1. Supabase Dashboard → Table Editor → `care_receiver_audits` テーブルを開く
2. 最新のレコードを確認

#### 確認項目
- [ ] `care_receiver_id` が対象の利用者（AT）の UUID と一致する
- [ ] `changed_fields` に変更されたフィールド名が記録されている（例: `["display_name", "medical_care_detail"]`）
- [ ] `changed_fields` に個人情報の**値**は含まれていない（キー名のみ）
- [ ] `changed_at` が最新のタイムスタンプである
- [ ] `changed_by` が現在の認証済みユーザーの UUID である

#### 期待結果
✅ 監査ログが正しく記録され、個人情報の値は含まれていない

---

### 7. 本番環境での実名入力（Vercel デプロイ後のみ）

#### 手順
1. Vercel にデプロイされた本番環境を開く（例: `https://juushin-care-xxx.vercel.app`）
2. ログイン → 利用者詳細ページ → "🔒 詳細情報を編集"
3. **本番環境のみ**で以下を入力:
   - `full_name`: "山田 太郎"（実名）
   - `address`: "東京都〇〇区〇〇1-2-3"
   - `phone`: "03-1234-5678"
   - `emergency_contact`: "緊急連絡先: 090-xxxx-xxxx"
4. "保存" ボタンをクリック

#### 確認項目
- [ ] データが正常に保存される
- [ ] ブラウザの Console に個人情報が出力されていない
- [ ] Supabase Table Editor で `care_receivers` テーブルを確認し、`full_name`, `address`, `phone` が保存されていることを確認
- [ ] 開発環境（ローカル）では引き続き匿名データのみを使用する

#### 期待結果
✅ 本番環境でのみ実名が入力され、開発環境では匿名データのみが使用される

---

## 回帰テスト（既存機能への影響確認）

### 1. 既存の "✏️ 簡易編集" ボタン
- [ ] 既存の簡易編集ダイアログが正常に動作する
- [ ] `display_name` の更新が正常に反映される

### 2. ケース記録機能
- [ ] `/services/life-care/users/AT/case-records` が正常に表示される
- [ ] ケース記録の保存が正常に動作する

### 3. A4 記録シート
- [ ] 利用者詳細ページの "A4記録シート" セクションが正常に表示される
- [ ] `display_name` が正しく反映される（実名ではなく匿名表示）

---

## トラブルシューティング

### エラー: "permission denied for table care_receivers"
**原因**: RLS ポリシーが有効化されており、認証されていないユーザーがアクセスできない  
**対処**: Supabase Auth でログインしてから再度アクセス

### エラー: "409 Conflict"（常に発生する）
**原因**: `version` カラムが正しく送信されていない、または DB トリガーが動作していない  
**対処**: 
1. Supabase SQL Editor で以下を実行し、トリガーが存在するか確認:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'increment_care_receiver_version';
   ```
2. トリガーが存在しない場合、migration を再実行: `npx supabase db reset`

### エラー: Console に個人情報が出力される
**原因**: API レスポンスで `sanitizedResponse` を使用していない  
**対処**: `app/api/care-receivers/[id]/route.ts` の GET/PUT エンドポイントで `sanitizedResponse` を使用していることを確認

---

## まとめ

- **開発環境**: 匿名データのみ使用、個人情報はログに出さない、RLS で保護
- **本番環境**: 実名入力可能、但しログには出さない
- **楽観ロック**: 同時編集を検出し、409 UI で丁寧に案内
- **監査ログ**: 変更されたフィールド名のみ記録、値は含めない

全てのテストケースが✅であれば、利用者情報編集機能は正常に動作しています。
