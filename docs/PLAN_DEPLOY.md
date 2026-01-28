# Vercel 本番デプロイ計画

> **📌 対象読者**: デプロイ担当者、運用担当者  
> **前提**: `docs/PLAN_MASTER.md` を先に読んでいること

---

## 🎯 デプロイ目標

- **目的**: 重心ケアアプリを Vercel + Supabase 本番環境にデプロイする
- **期待動作**: トップページ表示 → ログイン → ATさんページ → ケース記録導線が全て動作
- **セキュリティ**: RLS 有効、環境変数で認証情報管理、シークレットはコミット禁止

---

## 📋 デプロイ前チェックリスト

### ✅ コード準備
- [ ] `pnpm build` がローカルで成功する
- [ ] `pnpm lint` でエラーが 0 件
- [ ] `pnpm typecheck` でエラーが 0 件
- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] シークレット（API キー）がコード内にハードコードされていない

### ✅ Supabase 準備
- [ ] 本番用 Supabase プロジェクト作成済み
- [ ] `case_records` テーブルに `version` カラム追加済み（migration 実行）
- [ ] RLS ポリシーが有効化されている
- [ ] 開発用シードデータ（ATさん）投入済み

### ✅ Vercel 準備
- [ ] Vercel アカウント作成済み
- [ ] GitHub リポジトリと連携済み
- [ ] 環境変数を Production/Preview/Development 全てに設定済み

---

## 🔧 環境変数設定（Vercel）

### 設定場所
Vercel Dashboard → Project Settings → Environment Variables

### 必須環境変数

| 変数名 | 説明 | 取得元 | 適用環境 |
|--------|------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | Supabase Dashboard → Project Settings → API | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー（公開OK） | Supabase Dashboard → Project Settings → API | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー（サーバーのみ） | Supabase Dashboard → Project Settings → API | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | アプリ本番 URL（推奨） | Vercel デプロイ後の URL | Production |

### 取得手順

#### 1. Supabase プロジェクト作成
```bash
# Supabase CLI でログイン
npx supabase login

# 新規プロジェクト作成（Web UIからでもOK）
# https://supabase.com/dashboard → "New Project"
```

#### 2. API キー取得
1. Supabase Dashboard → プロジェクト選択
2. Settings → API
3. 以下をコピー：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` **（絶対に公開しない）**

#### 3. Vercel で環境変数設定
```bash
# Vercel CLI で設定（推奨）
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 値を入力: https://xxx.supabase.co
# 適用環境: Production, Preview, Development を全選択

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 値を入力: eyJhbGciOi...（anon キー）
# 適用環境: Production, Preview, Development を全選択

vercel env add SUPABASE_SERVICE_ROLE_KEY
# 値を入力: eyJhbGciOi...（service_role キー）
# 適用環境: Production, Preview, Development を全選択

vercel env add NEXT_PUBLIC_APP_URL
# 値を入力: https://juushin-care.vercel.app（デプロイ後に確定）
# 適用環境: Production
```

---

## 🚀 デプロイ手順

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

# デプロイ成功後、URL が表示される（例: https://juushin-care-xxx.vercel.app）
```

### 方法2: GitHub 連携（自動デプロイ）

1. Vercel Dashboard → "Add New Project"
2. GitHub リポジトリ `katoutomohiro/juushin-care-system-v0-careapp8` を選択
3. Framework Preset: "Next.js" が自動選択されることを確認
4. Environment Variables を設定（上記の必須環境変数を全て入力）
5. "Deploy" ボタンをクリック

**以降、`main` ブランチへの push で自動デプロイされる**

---

## 🗄️ Supabase マイグレーション実行

### ローカルで migration テスト
```bash
# Supabase CLI でローカル環境起動
npx supabase start

# migration 適用
npx supabase db reset

# 確認
npx supabase db diff
```

### 本番環境に migration 適用
```bash
# 本番 Supabase プロジェクトにリンク
npx supabase link --project-ref <your-project-id>

# migration を本番に適用
npx supabase db push

# 確認: case_records テーブルに version カラムがあるか
# Supabase Dashboard → Table Editor → case_records → Columns で確認
```

---

## ✅ デプロイ後の確認手順

### 1. トップページ表示確認
```
URL: https://juushin-care-xxx.vercel.app/
期待動作: ホーム画面が表示される（ローディングエラー無し）
```

### 2. ログイン確認
```
URL: https://juushin-care-xxx.vercel.app/login
期待動作: ログインフォームが表示される
テストアカウント: （Supabase に事前登録したテストユーザー）
```

### 3. ATさんページ確認
```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT
期待動作:
- ATさんのプロフィールが表示される
- "Case Records" ボタンが表示される
```

### 4. ケース記録導線確認
```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT/case-records
期待動作:
- ケース記録フォームが表示される
- 職員選択ドロップダウンが動作する
- 保存ボタンをクリックして保存成功する
- 409 Conflict ダイアログが正しく動作する（同時編集テスト）
```

---

## 🔍 デプロイ後のトラブルシューティング

### エラー: "Supabase client error"
**原因**: 環境変数が正しく設定されていない

**確認方法**:
```bash
# Vercel 環境変数を確認
vercel env ls

# 期待値:
# NEXT_PUBLIC_SUPABASE_URL: https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOi...
# SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOi...
```

**解決方法**:
1. Vercel Dashboard → Environment Variables で値を再確認
2. 値を修正後、再デプロイ: `vercel --prod`

---

### エラー: "Table 'case_records' does not exist"
**原因**: マイグレーションが本番 Supabase に適用されていない

**解決方法**:
```bash
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

---

### エラー: "RLS policy violation"
**原因**: RLS ポリシーが厳しすぎる、または認証情報が不足

**確認方法**:
1. Supabase Dashboard → Authentication → Users でテストユーザーが存在するか確認
2. Supabase Dashboard → Table Editor → case_records → Policies で RLS ポリシーを確認

**解決方法**:
- 開発環境では RLS を一時的に無効化してテスト
- 本番では適切な RLS ポリシーを設定（`docs/API_ROUTE_EXAMPLE_RLS.md` 参照）

---

### エラー: "409 Conflict が常に発生する"
**原因**: version カラムが正しく更新されていない

**確認方法**:
```sql
-- Supabase SQL Editor で実行
SELECT id, version, updated_at FROM case_records ORDER BY updated_at DESC LIMIT 10;
```

**解決方法**:
- トリガー `increment_version()` が正しく作成されているか確認
- `supabase/migrations/20260128093212_add_version_to_case_records.sql` を再実行

---

## 📊 モニタリング・ログ確認

### Vercel ログ
```bash
# リアルタイムログ確認
vercel logs --follow

# 最近のログを表示
vercel logs
```

### Supabase ログ
1. Supabase Dashboard → Logs
2. 「Postgres Logs」でクエリエラーを確認
3. 「API Logs」でリクエストエラーを確認

---

## 🔐 セキュリティチェックリスト

### デプロイ前
- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] `SUPABASE_SERVICE_ROLE_KEY` がコード内にハードコードされていない
- [ ] RLS ポリシーが有効化されている（`auth.uid()` チェック）

### デプロイ後
- [ ] Vercel 環境変数が全て設定されている
- [ ] `SUPABASE_SERVICE_ROLE_KEY` が "Production" 環境のみに設定されている
- [ ] HTTPS 接続が有効（Vercel は自動で HTTPS 化）
- [ ] CSP（Content Security Policy）ヘッダーが設定されている（`next.config.ts` で設定）

---

## 🚨 緊急時のロールバック

### Vercel でロールバック
```bash
# 最近のデプロイ一覧を表示
vercel ls

# 前のデプロイにロールバック
vercel rollback <deployment-url>
```

### Supabase でロールバック
```bash
# マイグレーションを戻す（慎重に！）
npx supabase db reset

# または特定のマイグレーションを削除
# supabase/migrations/ から該当ファイルを削除後、再度 db push
```

---

## 📝 Vercel 安定化メモ（追記：2026年1月28日）

### Environment Variables の適用範囲
**重要**: Vercel の環境変数は以下の3つの環境に個別設定できる
- **Production**: 本番環境（main ブランチのデプロイ）
- **Preview**: プレビュー環境（PR ごとのデプロイ）
- **Development**: ローカル開発（`vercel dev` 使用時）

**推奨設定**: すべての環境変数を **Production, Preview, Development 全てに適用**

理由:
- Preview 環境で本番同等のテストを実施できる
- PR レビュー時に動作確認が可能
- ローカル開発で `vercel dev` を使う場合に環境変数が自動適用される

---

### NEXT_PUBLIC_APP_URL の追加案

**目的**: Next.js アプリ内で絶対 URL を生成する際に使用

**使用例**:
```typescript
// サーバーコンポーネントで絶対URLを生成
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const absoluteUrl = `${appUrl}/services/life-care/users/AT/case-records`
```

**Vercel 設定**:
```bash
vercel env add NEXT_PUBLIC_APP_URL
# Production: https://juushin-care.vercel.app
# Preview: https://juushin-care-git-<branch>.vercel.app
# Development: http://localhost:3000
```

**メリット**:
- OGP タグ生成時に正しい URL を設定できる
- メール送信時の確認リンク生成に利用できる
- PWA マニフェストの start_url 設定に利用できる

---

### デプロイ後の確認手順（詳細版）

#### 1. トップページ表示
```
URL: https://juushin-care-xxx.vercel.app/
確認項目:
- [ ] ホーム画面が表示される
- [ ] ローディングエラーが無い
- [ ] Tailwind CSS スタイルが適用されている
- [ ] Service Worker 登録エラーが無い
```

#### 2. ログイン導線
```
URL: https://juushin-care-xxx.vercel.app/login
確認項目:
- [ ] ログインフォームが表示される
- [ ] Supabase Auth が動作する
- [ ] ログイン成功後、ホームにリダイレクトされる
```

#### 3. ATさんページ
```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT
確認項目:
- [ ] ATさんのプロフィールが表示される
- [ ] "Case Records" ボタンが表示される
- [ ] ボタンクリックで case-records ページに遷移する
```

#### 4. ケース記録ページ
```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT/case-records
確認項目:
- [ ] ケース記録フォームが表示される
- [ ] 職員選択ドロップダウンが動作する（職員データが表示される）
- [ ] 日付選択が動作する
- [ ] カスタムフィールド（ATさん用テンプレート）が表示される
- [ ] 保存ボタンをクリックして保存成功する
- [ ] 保存成功後、一覧に新規記録が表示される
```

#### 5. 同時編集制御テスト
```
手順:
1. 同じケース記録を2つのタブで開く
2. タブ1で編集・保存 → version が 1→2 に増加
3. タブ2で古い version: 1 のまま保存試行
4. 期待動作: 409 Conflict ダイアログ表示
5. "最新データを再読み込み" ボタンで更新
6. タブ2でフォームが最新データ（version: 2）にリフレッシュされる
```

---

## 🔄 継続的デプロイ（CI/CD）

### GitHub Actions 連携（将来実装）

現在は Vercel の GitHub 連携で自動デプロイされているが、将来的には以下を追加:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📚 関連ドキュメント

- **詳細デプロイ手順**: `docs/DEPLOYMENT.md`
- **同時編集制御**: `docs/CONCURRENCY.md`
- **RLS ポリシー**: `docs/API_ROUTE_EXAMPLE_RLS.md`
- **環境構築**: `SETUP_LOCAL.md`

---

**最終更新**: 2026年1月28日  
**次回更新タイミング**: 本番デプロイ実行後、または環境変数追加時
