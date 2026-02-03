# Vercel 本番デプロイ チェックリスト

> **📌 対象読者**: デプロイ担当者、運用担当者  
> **前提**: `docs/PLAN_DEPLOY.md` を確認済みであること  
> **重要**: シークレット（API キー）を GitHub にコミットしないこと

---

## A. デプロイ前（ローカル）

### コード品質確認

- [ ] `pnpm build` がローカルで成功する
- [ ] `pnpm lint` でエラーが 0 件
- [ ] `pnpm typecheck` でエラーが 0 件
- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] シークレット（API キー）がコード内にハードコードされていない

**確認コマンド**:
```bash
pnpm build
pnpm lint
pnpm typecheck
grep -E "(SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY)" src/**/*.ts app/**/*.ts
# → シークレットが直接書かれていないこと確認
```

---

## B. Supabase（本番）準備

### 本番プロジェクト構築

- [ ] 本番用 Supabase プロジェクト作成済み
- [ ] `case_records` テーブルに `version` カラム追加済み（migration 適用済み）
- [ ] RLS ポリシーが有効化されている
- [ ] 開発用シードデータ（ATさん・匿名）投入済み

**確認方法**:
```bash
# 本番 Supabase にリンク
npx supabase link --project-ref <your-project-id>

# case_records テーブル確認
# Supabase Dashboard → Table Editor → case_records → Columns で version 列確認
```

---

## C. Vercel 準備（環境変数）

### アカウント・リポジトリ連携

- [ ] Vercel アカウント作成済み
- [ ] GitHub リポジトリと連携済み
- [ ] リポジトリが Vercel Project として登録済み

### 環境変数設定

以下を **Production / Preview / Development 全てに設定済み**:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - 値: `https://xxx.supabase.co`
  - 取得元: Supabase Dashboard → Project Settings → API → Project URL

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - 値: `eyJhbGciOi...`（anon キー）
  - 取得元: Supabase Dashboard → Project Settings → API → anon public

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - 値: `eyJhbGciOi...`（service_role キー）
  - 取得元: Supabase Dashboard → Project Settings → API → service_role
  - ⚠️ **絶対に公開しないこと**

- [ ] `NEXT_PUBLIC_APP_URL`（Production のみ推奨）
  - 値: `https://juushin-care-xxx.vercel.app`（デプロイ後に確定）
  - 用途: 絶対 URL 生成、OGP タグ、メール確認リンク

**確認方法**:
```bash
# CLI で設定確認
vercel env ls

# 期待結果:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# NEXT_PUBLIC_APP_URL
```

---

## D. デプロイ（Vercel CLI 推奨）

### 方法1: Vercel CLI（推奨）

```bash
# 1. Vercel CLI インストール
npm install -g vercel

# 2. Vercel にログイン
vercel login

# 3. プロジェクトリンク（初回のみ）
cd c:\dev\juushin-care-system-v0-careapp8
vercel link

# 4. 本番デプロイ
vercel --prod
```

**チェックリスト**:
- [ ] Vercel CLI が正常にインストールされている
- [ ] Vercel にログイン済み
- [ ] プロジェクトリンク完了
- [ ] デプロイ成功（URL が表示される）

### 方法2: GitHub 連携デプロイ（代替）

- [ ] Vercel Dashboard で "Add New Project" をクリック
- [ ] GitHub リポジトリを選択
- [ ] Framework Preset が "Next.js" であることを確認
- [ ] 環境変数を全て設定（C. を参照）
- [ ] "Deploy" ボタンをクリック

---

## E. 本番 Supabase に Migration 適用

### Migration 実行

```bash
# 本番 Supabase にリンク
npx supabase link --project-ref <your-project-id>

# Migration を本番に適用
npx supabase db push
```

**チェックリスト**:
- [ ] Migration 実行成功
- [ ] エラーメッセージなし
- [ ] Supabase Dashboard で `case_records.version` カラム確認済み

---

## F. セキュリティ確認（個人情報）

### RLS ポリシー確認

Supabase SQL Editor で以下を実行:

```sql
SET ROLE anon;
SELECT full_name, address, phone FROM care_receivers LIMIT 1;
```

**期待結果**:
- [ ] 0 件返却（RLS で個人情報がマスクされている）
- [ ] エラーメッセージなし

### ログ出力確認

本番デプロイ後、利用者情報編集画面を開く:

- [ ] ブラウザ Console に `full_name`, `address`, `phone` が出力されていない
- [ ] API レスポンスが sanitized されている
- [ ] 個人情報がログに含まれていない

### シードデータ確認

- [ ] seed ファイルに実名・住所・電話番号が含まれていない
- [ ] 開発用シードデータは匿名のみ（例: `display_name: AT`, `display_name: User-001`）
- [ ] 本番環境でのみ実データを入力

---

## G. デプロイ後の動作確認（最短チェック）

### 1. トップページ表示

```
URL: https://juushin-care-xxx.vercel.app/
```

- [ ] ホーム画面が表示される
- [ ] ローディングエラーなし
- [ ] Tailwind CSS が適用されている

### 2. ログイン

```
URL: https://juushin-care-xxx.vercel.app/login
```

- [ ] ログインフォーム表示
- [ ] テストアカウントでログイン成功
- [ ] ログイン後、ホームにリダイレクト

### 3. ATさんページ

```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT
```

- [ ] プロフィール表示
- [ ] "Case Records" ボタン表示

### 4. ケース記録フォーム

```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT/case-records
```

- [ ] ケース記録フォーム表示
- [ ] 職員選択ドロップダウン動作
- [ ] フォーム入力・保存成功

### 5. 同時編集制御（409 Conflict）

**手順**:
1. 同じケース記録を 2 つのタブで開く
2. タブ 1 で編集・保存（version: 1 → 2）
3. タブ 2 で古い version のまま保存試行

**期待動作**:
- [ ] 409 Conflict ダイアログ表示
- [ ] "最新データを再読み込み" ボタンで更新
- [ ] タブ 2 のフォームが最新データにリフレッシュ

---

## H. 監視・ログ

### Vercel ログ確認

```bash
# リアルタイムログ
vercel logs --follow

# 最近のログ
vercel logs
```

**チェックリスト**:
- [ ] エラーログなし
- [ ] ビルド成功
- [ ] デプロイ完了

### Supabase ログ確認

1. Supabase Dashboard → Logs
2. 「Postgres Logs」でクエリエラー確認
3. 「API Logs」でリクエストエラー確認

**チェックリスト**:
- [ ] クエリエラーなし
- [ ] API エラーなし
- [ ] RLS エラーなし

---

## I. トラブル時（最小手順）

### エラー: "Supabase client error"

**確認**:
```bash
vercel env ls
```

**修正**:
1. Vercel Dashboard で環境変数を再確認
2. 値を修正
3. `vercel --prod` で再デプロイ

### エラー: "Table 'case_records' does not exist"

**修正**:
```bash
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

### エラー: "RLS policy violation"

**確認**:
1. Supabase Dashboard → Authentication で テストユーザー確認
2. Table Editor → Policies で RLS ポリシー確認

**解決**:
- 開発環境では RLS を一時無効化してテスト
- 本番では適切な RLS ポリシーを設定

### エラー: "409 Conflict が常に発生する"

**確認**:
```sql
SELECT id, version, updated_at FROM case_records ORDER BY updated_at DESC LIMIT 10;
```

**修正**:
- トリガー `increment_version()` が正しく作成されているか確認
- migration ファイルを再実行

---

## J. ロールバック（緊急時のみ）

### Vercel ロールバック

```bash
# 最近のデプロイ一覧
vercel ls

# 前のデプロイに戻す
vercel rollback <deployment-url>
```

**チェックリスト**:
- [ ] デプロイ一覧表示成功
- [ ] ロールバック実行成功
- [ ] 前の URL で動作確認

### Supabase ロールバック（慎重に）

```bash
# ローカルで migration を削除後、再度 push
npx supabase db reset
```

**チェックリスト**:
- [ ] ロールバック実行前にバックアップ確認
- [ ] 本番データへの影響を最小化

---

## 📝 最終チェック

- [ ] すべてのセクション A～J が完了
- [ ] 本番環境で期待動作を確認
- [ ] ログにエラーがない
- [ ] シークレットが GitHub にコミットされていない

---

**デプロイ完了日**: _______________  
**デプロイ担当者**: _______________  
**URL**: https://_______________  

---

関連ドキュメント:
- [PLAN_DEPLOY.md](PLAN_DEPLOY.md)
- [API_ROUTE_EXAMPLE_RLS.md](API_ROUTE_EXAMPLE_RLS.md)
- [SETUP_LOCAL.md](../SETUP_LOCAL.md)
