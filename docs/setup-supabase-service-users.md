# Supabase セットアップ手順（service_users / staff_members / case_records）

このドキュメントは、NEXT_PUBLIC_SUPABASE_URL が指す Supabase プロジェクトで、利用者デフォルト設定とケース記録機能を動かすための手順です。ブラウザ操作のみで完結します。

## 0. 前提
- リポジトリ: `C:\dev\juushin-care-system-v0-careapp8`
- `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`（必要なら `SUPABASE_SERVICE_ROLE_KEY`）が設定済み。
- 例: `NEXT_PUBLIC_SUPABASE_URL=https://avnjshakcbnxhdmetyni.supabase.co`

## 1. プロジェクトIDの確認
1. `.env.local` を開き、`NEXT_PUBLIC_SUPABASE_URL` を確認します。  
   例: `https://avnjshakcbnxhdmetyni.supabase.co` → プロジェクトIDは `avnjshakcbnxhdmetyni`。

## 2. Supabase Studio で対象プロジェクトを開く
1. ブラウザで https://app.supabase.com にログイン。
2. プロジェクト一覧から、手順1で控えたプロジェクトIDを含むものを選択。
3. 右上の Project Settings → API で Project URL が `.env.local` と一致することを確認。

## 3. Table Editor でテーブルの有無を確認
1. 左メニュー「Table Editor」を開く。
2. public スキーマ配下で次のテーブルを探します。
   - `service_users`（利用者デフォルト設定）
   - `staff_members`（スタッフマスタ）
   - `case_records`（ケース記録）
3. 見つからない場合は「テーブルなし」です。次の手順で SQL を実行します。

## 4. SQL Editor で DDL を実行
1. 左メニュー「SQL」→「New query」を開く。
2. リポジトリの以下ファイルを開き、内容をそのまま貼り付けて `RUN` します（各ファイルは idempotent です）。
   - `supabase/sql/2025-11-28-service-users-defaults.sql`（service_users）
   - `supabase/sql/2025-11-26-staff-members.sql`（staff_members）
   - `supabase/sql/2025-11-case-records.sql`（case_records 生成）
   - `supabase/sql/2025-11-23-case-records-content.sql`（case_records の content 列追加・インデックス）
3. 実行後、再度 Table Editor で各テーブルが作成されていることを確認します。

## 5. 動作確認（ローカル）
1. `pnpm dev` を再起動。
2. ブラウザで `http://localhost:3000/api/service-users/A-T/defaults` を開く。  
   - 期待: ステータス 200、body が `{ ok:true, defaults: ... }` または `{ ok:true, defaults: null }`。
   - 500 で "service_users table missing" が出る場合、SQL が未適用か別プロジェクトを見ている可能性があります。
3. `/services/life-care/users/A-T` を開き、編集モーダルでデフォルトを保存。  
   - Network タブで `POST /api/service-users/A-T/defaults` が 200 / `{ ok:true }` になること。  
   - モーダルを閉じて再オープンし、保存値が保持されることを確認。
4. `/services/life-care/users/A-T/case-records/excel` を未保存の日付で開き、ヘッダーにデフォルト（主/従担当・開始/終了・トータル・日中一時 午前/午後）が自動反映されることを確認。既存日付では既存記録が優先されることも確認。

## 6. ヘルスチェック（任意）
- `http://localhost:3000/debug/db-health` を開くと、service_users / staff_members / case_records が存在するかを一覧表示します。足りないテーブルがあれば該当 SQL を実行してください。

## 7. よくあるエラーと見方
- `PGRST205` / `Could not find the table ... in the schema cache`  
  → テーブル未作成、または別プロジェクトを参照しています。手順1〜4を確認。
- `service_users table missing`（APIレスポンス/コンソール）  
  → 上と同じ原因。SQL を適用したプロジェクトが正しいか再確認。

以上でセットアップ完了です。テーブルさえ作成されていれば、保存〜ケース記録ヘッダーへの反映まで一気通貫で動作します。
