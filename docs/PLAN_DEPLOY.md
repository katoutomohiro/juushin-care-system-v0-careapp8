# Vercel 本番チE�Eロイ計画

> **📌 対象読老E*: チE�Eロイ拁E��老E��E��用拁E��老E 
> **前提**: `docs/PLAN_MASTER.md` を�Eに読んでぁE��こと

---

## 🎯 チE�Eロイ目樁E
- **目皁E*: 重忁E��アアプリめEVercel + Supabase 本番環墁E��チE�Eロイする
- **期征E��佁E*: トップ�Eージ表示 ↁEログイン ↁEATさんペ�Eジ ↁEケース記録導線が全て動佁E- **セキュリチE��**: RLS 有効、環墁E��数で認証惁E��管琁E��シークレチE��はコミット禁止

---

## 📋 チE�Eロイ前チェチE��リスチE
### ✁Eコード準備
- [ ] `pnpm build` がローカルで成功する
- [ ] `pnpm lint` でエラーぁE0 件
- [ ] `pnpm typecheck` でエラーぁE0 件
- [ ] `.env.local` ぁE`.gitignore` に含まれてぁE��
- [ ] シークレチE���E�EPI キー�E�がコード�Eにハ�EドコードされてぁE��ぁE
### ✁ESupabase 準備
- [ ] 本番用 Supabase プロジェクト作�E済み
- [ ] `case_records` チE�Eブルに `version` カラム追加済み�E�Eigration 実行！E- [ ] RLS ポリシーが有効化されてぁE��
- [ ] 開発用シードデータ�E�ETさん�E�投入済み

### ✁EVercel 準備
- [ ] Vercel アカウント作�E済み
- [ ] GitHub リポジトリと連携済み
- [ ] 環墁E��数めEProduction/Preview/Development 全てに設定済み

---

## 🔧 環墁E��数設定！Eercel�E�E
### 設定場所
Vercel Dashboard ↁEProject Settings ↁEEnvironment Variables

### 忁E��環墁E��数

| 変数吁E| 説昁E| 取得�E | 適用環墁E|
|--------|------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクチEURL | Supabase Dashboard ↁEProject Settings ↁEAPI | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー�E��E開OK�E�E| Supabase Dashboard ↁEProject Settings ↁEAPI | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー�E�サーバ�Eのみ�E�E| Supabase Dashboard ↁEProject Settings ↁEAPI | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | アプリ本番 URL�E�推奨�E�E| Vercel チE�Eロイ後�E URL | Production |

### 取得手頁E
#### 1. Supabase プロジェクト作�E
```bash
# Supabase CLI でログイン
npx supabase login

# 新規�Eロジェクト作�E�E�Eeb UIからでもOK�E�E# https://supabase.com/dashboard ↁE"New Project"
```

#### 2. API キー取征E1. Supabase Dashboard ↁEプロジェクト選抁E2. Settings ↁEAPI
3. 以下をコピ�E�E�E   - `Project URL` ↁE`NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` ↁE`NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` ↁE`SUPABASE_SERVICE_ROLE_KEY` **�E�絶対に公開しなぁE��E*

#### 3. Vercel で環墁E��数設宁E```bash
# Vercel CLI で設定（推奨�E�Evercel env add NEXT_PUBLIC_SUPABASE_URL
# 値を�E劁E https://xxx.supabase.co
# 適用環墁E Production, Preview, Development を�E選抁E
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 値を�E劁E eyJhbGciOi...�E�Enon キー�E�E# 適用環墁E Production, Preview, Development を�E選抁E
vercel env add SUPABASE_SERVICE_ROLE_KEY
# 値を�E劁E eyJhbGciOi...�E�Eervice_role キー�E�E# 適用環墁E Production, Preview, Development を�E選抁E
vercel env add NEXT_PUBLIC_APP_URL
# 値を�E劁E https://juushin-care.vercel.app�E�デプロイ後に確定！E# 適用環墁E Production
```

---

## 🚀 チE�Eロイ手頁E
### 方況E: Vercel CLI�E�推奨�E�E
```bash
# 1. Vercel CLI インスト�Eル
npm install -g vercel

# 2. Vercel にログイン
vercel login

# 3. プロジェクトリンク�E��E回�Eみ�E�Ecd c:\dev\juushin-care-system-v0-careapp8
vercel link

# 4. 本番チE�Eロイ
vercel --prod

# チE�Eロイ成功後、URL が表示される（侁E https://juushin-care-xxx.vercel.app�E�E```

### 方況E: GitHub 連携�E��E動デプロイ�E�E
1. Vercel Dashboard ↁE"Add New Project"
2. GitHub リポジトリ `katoutomohiro/juushin-care-system-v0-careapp8` を選抁E3. Framework Preset: "Next.js" が�E動選択されることを確誁E4. Environment Variables を設定（上記�E忁E��環墁E��数を�Eて入力！E5. "Deploy" ボタンをクリチE��

**以降、`main` ブランチへの push で自動デプロイされめE*

---

## 🗄�E�ESupabase マイグレーション実衁E
### ローカルで migration チE��チE```bash
# Supabase CLI でローカル環墁E��勁Enpx supabase start

# migration 適用
npx supabase db reset

# 確誁Enpx supabase db diff
```

### 本番環墁E�� migration 適用
```bash
# 本番 Supabase プロジェクトにリンク
npx supabase link --project-ref <your-project-id>

# migration を本番に適用
npx supabase db push

# 確誁E case_records チE�Eブルに version カラムがあるか
# Supabase Dashboard ↁETable Editor ↁEcase_records ↁEColumns で確誁E```

---

## 🔐 個人惁E��の運用ポリシー�E�重要E��E
### 基本方釁E- **開発環墁E��は個人惁E��を使用しなぁE*: 開発・レビュー時�E匿名データ�E�Edisplay_name: AT`, `display_name: User-001` など�E��Eみ使用
- **本番環墁E��のみ実名を�E劁E*: 利用老E��報の `full_name`, `address`, `phone`, `emergency_contact` は本番環墁E�Eみで入劁E- **シードデータは匿名�Eみ**: migration めEseed ファイルには実名・住所・電話番号を含めなぁE
### 確認手頁E
#### 1. RLS ポリシー確認！Enon から個人惁E��が取得できなぁE��と�E�E```sql
-- Supabase SQL Editor で実衁ESET ROLE anon;  -- 認証前�Eユーザーロール
SELECT full_name, address, phone FROM care_receivers LIMIT 1;
-- 期征E��果: 0件返却�E�ELS で拒否される！E```

#### 2. ログ出力確認（個人惁E��がログに出なぁE��と�E�E- ブラウザの Developer Tools ↁEConsole を開ぁE- 利用老E��報編雁E��面を開ぁEↁEフォーム送信
- Console に `full_name`, `address`, `phone` などが�E力されてぁE��ぁE��と確誁E- API レスポンスは sanitized されてぁE���E�個人惁E��を除外したログのみ�E�E
#### 3. 本番環墁E��の初回チE�Eタ入劁E- チE�Eロイ後、E*本番環墁E�Eみ**で利用老E��報を�E劁E- 開発環墁E��ローカル/Preview�E�では引き続き匿名データを使用

---

## ✁EチE�Eロイ後�E確認手頁E
### 1. トップ�Eージ表示確誁E```
URL: https://juushin-care-xxx.vercel.app/
期征E��佁E ホ�Eム画面が表示される（ローチE��ングエラー無し！E```

### 2. ログイン確誁E```
URL: https://juushin-care-xxx.vercel.app/login
期征E��佁E ログインフォームが表示されめEチE��トアカウンチE �E�Eupabase に事前登録したチE��トユーザー�E�E```

### 3. ATさんペ�Eジ確誁E```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT
期征E��佁E
- ATさんのプロフィールが表示されめE- "Case Records" ボタンが表示されめE```

### 4. ケース記録導線確誁E```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT/case-records
期征E��佁E
- ケース記録フォームが表示されめE- 職員選択ドロチE�Eダウンが動作すめE- 保存�EタンをクリチE��して保存�E功すめE- 409 Conflict ダイアログが正しく動作する（同時編雁E��スト！E```

---

## 🔍 チE�Eロイ後�EトラブルシューチE��ング

### エラー: "Supabase client error"
**原因**: 環墁E��数が正しく設定されてぁE��ぁE
**確認方況E*:
```bash
# Vercel 環墁E��数を確誁Evercel env ls

# 期征E��:
# NEXT_PUBLIC_SUPABASE_URL: https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOi...
# SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOi...
```

**解決方況E*:
1. Vercel Dashboard ↁEEnvironment Variables で値を�E確誁E2. 値を修正後、�EチE�Eロイ: `vercel --prod`

---

### エラー: "Table 'case_records' does not exist"
**原因**: マイグレーションが本番 Supabase に適用されてぁE��ぁE
**解決方況E*:
```bash
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

---

### エラー: "RLS policy violation"
**原因**: RLS ポリシーが厳しすぎる、また�E認証惁E��が不足

**確認方況E*:
1. Supabase Dashboard ↁEAuthentication ↁEUsers でチE��トユーザーが存在するか確誁E2. Supabase Dashboard ↁETable Editor ↁEcase_records ↁEPolicies で RLS ポリシーを確誁E
**解決方況E*:
- 開発環墁E��は RLS を一時的に無効化してチE��チE- 本番では適刁E�� RLS ポリシーを設定！Edocs/API_ROUTE_EXAMPLE_RLS.md` 参�E�E�E
---

### エラー: "409 Conflict が常に発生すめE
**原因**: version カラムが正しく更新されてぁE��ぁE
**確認方況E*:
```sql
-- Supabase SQL Editor で実衁ESELECT id, version, updated_at FROM case_records ORDER BY updated_at DESC LIMIT 10;
```

**解決方況E*:
- トリガー `increment_version()` が正しく作�EされてぁE��か確誁E- `supabase/migrations/20260128093212_add_version_to_case_records.sql` を�E実衁E
---

## 📊 モニタリング・ログ確誁E
### Vercel ログ
```bash
# リアルタイムログ確誁Evercel logs --follow

# 最近�Eログを表示
vercel logs
```

### Supabase ログ
1. Supabase Dashboard ↁELogs
2. 「Postgres Logs」でクエリエラーを確誁E3. 「API Logs」でリクエストエラーを確誁E
---

## 🔐 セキュリチE��チェチE��リスチE
### チE�Eロイ剁E- [ ] `.env.local` ぁE`.gitignore` に含まれてぁE��
- [ ] `SUPABASE_SERVICE_ROLE_KEY` がコード�Eにハ�EドコードされてぁE��ぁE- [ ] RLS ポリシーが有効化されてぁE���E�Eauth.uid()` チェチE���E�E
### チE�Eロイ征E- [ ] Vercel 環墁E��数が�Eて設定されてぁE��
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ぁE"Production" 環墁E�Eみに設定されてぁE��
- [ ] HTTPS 接続が有効�E�Eercel は自動で HTTPS 化！E- [ ] CSP�E�Eontent Security Policy�E��EチE��ーが設定されてぁE���E�Enext.config.ts` で設定！E
---

## 🚨 緊急時�Eロールバック

### Vercel でロールバック
```bash
# 最近�EチE�Eロイ一覧を表示
vercel ls

# 前�EチE�Eロイにロールバック
vercel rollback <deployment-url>
```

### Supabase でロールバック
```bash
# マイグレーションを戻す（�E重に�E�E��Enpx supabase db reset

# また�E特定�Eマイグレーションを削除
# supabase/migrations/ から該当ファイルを削除後、�E度 db push
```

---

## 📝 Vercel 安定化メモ�E�追記！E026年1朁E8日�E�E
### Environment Variables の適用篁E��
**重要E*: Vercel の環墁E��数は以下�E3つの環墁E��個別設定できる
- **Production**: 本番環墁E��Eain ブランチ�EチE�Eロイ�E�E- **Preview**: プレビュー環墁E��ER ごとのチE�Eロイ�E�E- **Development**: ローカル開発�E�Evercel dev` 使用時！E
**推奨設宁E*: すべての環墁E��数めE**Production, Preview, Development 全てに適用**

琁E��:
- Preview 環墁E��本番同等�EチE��トを実施できる
- PR レビュー時に動作確認が可能
- ローカル開発で `vercel dev` を使ぁE��合に環墁E��数が�E動適用されめE
---

### NEXT_PUBLIC_APP_URL の追加桁E
**目皁E*: Next.js アプリ冁E��絶対 URL を生成する際に使用

**使用侁E*:
```typescript
// サーバ�Eコンポ�Eネントで絶対URLを生戁Econst appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://dev-app.local:3000'
const absoluteUrl = `${appUrl}/services/life-care/users/AT/case-records`
```

**Vercel 設宁E*:
```bash
vercel env add NEXT_PUBLIC_APP_URL
# Production: https://juushin-care.vercel.app
# Preview: https://juushin-care-git-<branch>.vercel.app
# Development: http://dev-app.local:3000
```

**メリチE��**:
- OGP タグ生�E時に正しい URL を設定できる
- メール送信時�E確認リンク生�Eに利用できる
- PWA マニフェスト�E start_url 設定に利用できる

---

### チE�Eロイ後�E確認手頁E��詳細版！E
#### 1. トップ�Eージ表示
```
URL: https://juushin-care-xxx.vercel.app/
確認頁E��:
- [ ] ホ�Eム画面が表示されめE- [ ] ローチE��ングエラーが無ぁE- [ ] Tailwind CSS スタイルが適用されてぁE��
- [ ] Service Worker 登録エラーが無ぁE```

#### 2. ログイン導緁E```
URL: https://juushin-care-xxx.vercel.app/login
確認頁E��:
- [ ] ログインフォームが表示されめE- [ ] Supabase Auth が動作すめE- [ ] ログイン成功後、�Eームにリダイレクトされる
```

#### 3. ATさんペ�Eジ
```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT
確認頁E��:
- [ ] ATさんのプロフィールが表示されめE- [ ] "Case Records" ボタンが表示されめE- [ ] ボタンクリチE��で case-records ペ�Eジに遷移する
```

#### 4. ケース記録ペ�Eジ
```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT/case-records
確認頁E��:
- [ ] ケース記録フォームが表示されめE- [ ] 職員選択ドロチE�Eダウンが動作する（�E員チE�Eタが表示される！E- [ ] 日付選択が動作すめE- [ ] カスタムフィールド！ETさん用チE��プレート）が表示されめE- [ ] 保存�EタンをクリチE��して保存�E功すめE- [ ] 保存�E功後、一覧に新規記録が表示されめE```

#### 5. 同時編雁E��御チE��チE```
手頁E
1. 同じケース記録めEつのタブで開く
2. タチEで編雁E�E保孁EↁEversion ぁE1ↁE に増加
3. タチEで古ぁEversion: 1 のまま保存試衁E4. 期征E��佁E 409 Conflict ダイアログ表示
5. "最新チE�Eタを�E読み込み" ボタンで更新
6. タチEでフォームが最新チE�Eタ�E�Eersion: 2�E�にリフレチE��ュされめE```

---

## 🔄 継続的チE�Eロイ�E�EI/CD�E�E
### GitHub Actions 連携�E�封E��実裁E��E
現在は Vercel の GitHub 連携で自動デプロイされてぁE��が、封E��皁E��は以下を追加:

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

## 📚 関連ドキュメンチE
- **詳細チE�Eロイ手頁E*: `docs/DEPLOYMENT.md`
- **同時編雁E��御**: `docs/CONCURRENCY.md`
- **RLS ポリシー**: `docs/API_ROUTE_EXAMPLE_RLS.md`
- **環墁E��篁E*: `SETUP_LOCAL.md`

---

**最終更新**: 2026年1朁E8日  
**次回更新タイミング**: 本番チE�Eロイ実行後、また�E環墁E��数追加晁E
