# 本番デプロイメントガイド

**対象**: 重心ケア支援アプリ v0  
**更新日**: 2026年1月28日  
**構成**: Vercel (Next.js) + Supabase (PostgreSQL + Auth)

---

## 📐 本番構成アーキテクチャ

```
[ユーザー（スマホ/タブレット/PC）]
         ↓
[Vercel Edge Network]
         ↓
[Next.js App (Vercel Functions)]
         ↓
[Supabase (PostgreSQL + Auth + Storage)]
```

### コンポーネント

| コンポーネント | 役割 | 技術スタック |
|--------------|------|------------|
| **フロントエンド** | PWA + UI | Next.js 15 + React 19 + Tailwind CSS |
| **API Routes** | サーバーロジック | Next.js API Routes (Vercel Functions) |
| **データベース** | 永続化層 | Supabase PostgreSQL |
| **認証** | ユーザー管理 | Supabase Auth |
| **ファイルストレージ** | 画像・添付 | Vercel Blob または Supabase Storage |
| **CDN** | 静的アセット配信 | Vercel Edge Network |

---

## 🔐 必要な環境変数

### Vercel 環境変数設定

**Production / Preview / Development 全環境で設定**:

```bash
# Supabase 接続情報（必須）
NEXT_PUBLIC_SUPABASE_URL=https://rlopopbtdydqchiifxla.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（Supabase Dashboard から取得）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...（管理者権限、秘匿情報）
SUPABASE_URL=https://rlopopbtdydqchiifxla.supabase.co

# 認証バイパス（開発専用、本番では設定しない）
# AUTH_BYPASS=true  # ⚠️ 本番では絶対に true にしない

# デバッグ（開発専用）
# DEBUG_MIDDLEWARE=true  # 本番では false または未設定

# Vercel Blob（オプション、画像保存に使用する場合）
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...（Vercel Dashboard から取得）

# OpenAI API（音声認識・AI機能を使う場合）
OPENAI_API_KEY=sk-...（OpenAI Dashboard から取得）

# Next.js 設定
NODE_ENV=production
```

### 環境変数の設定場所

**Vercel Dashboard**:
1. プロジェクトページ → Settings → Environment Variables
2. 各変数を **Production**, **Preview**, **Development** で個別設定
3. 秘匿情報（SERVICE_ROLE_KEY等）は **Encrypted** にチェック

**ローカル開発**:
- `.env.local` に設定（リポジトリに含めない）
- `.env.example` をコピーして作成

---

## 🚀 デプロイ手順

### 初回デプロイ（Vercel プロジェクト作成）

#### 1. Vercel プロジェクト作成

```bash
# Vercel CLI インストール（未インストールの場合）
npm i -g vercel

# プロジェクトルートで実行
cd c:\dev\juushin-care-system-v0-careapp8
vercel

# 対話型で以下を選択
# - Set up and deploy? Yes
# - Which scope? katoutomohiro（個人アカウント）
# - Link to existing project? No
# - Project name: juushin-care-system-v0-careapp8
# - In which directory is your code located? ./
# - Want to override settings? No
```

#### 2. 環境変数設定（Vercel Dashboard）

https://vercel.com/katoutomohiro/juushin-care-system-v0-careapp8/settings/environment-variables

上記「必要な環境変数」をすべて設定

#### 3. Supabase プロジェクト準備

**Supabase Dashboard**: https://supabase.com/dashboard

1. **マイグレーション実行**:
   ```bash
   # ローカルで Supabase CLI を使用
   npx supabase db push
   
   # または SQL Editor で手動実行
   # supabase/migrations/*.sql を順番に実行
   ```

2. **RLS ポリシー確認**:
   - `care_receivers`, `case_records`, `services`, `staff` テーブルの RLS が有効
   - 認証ユーザーのみアクセス可能なポリシー設定

3. **初期データ投入**:
   ```sql
   -- services テーブル
   INSERT INTO services (id, name, slug) VALUES
     (gen_random_uuid(), '生活介護', 'life-care'),
     (gen_random_uuid(), '放課後等デイサービス', 'after-school');
   
   -- care_receivers テーブル（サンプル）
   INSERT INTO care_receivers (id, code, name, display_name, service_id)
   VALUES (gen_random_uuid(), 'AT', 'A・T', 'A・Tさん', 
     (SELECT id FROM services WHERE slug = 'life-care' LIMIT 1));
   ```

#### 4. 初回デプロイ実行

```bash
# Production デプロイ
vercel --prod

# デプロイURL確認（例: https://juushin-care-system-v0-careapp8.vercel.app）
```

---

### 継続的デプロイ（GitHub 連携後）

#### GitHub 連携設定

1. **Vercel Dashboard** → Settings → Git
2. **Connect Git Repository** → GitHub → `katoutomohiro/juushin-care-system-v0-careapp8`
3. **Production Branch**: `main`
4. **Deploy Hooks**: 有効化

#### 自動デプロイフロー

```
main ブランチへ push/merge
  ↓
Vercel が自動検知
  ↓
ビルド実行（pnpm build）
  ↓
デプロイ（Production）
  ↓
ヘルスチェック
  ↓
本番URL更新
```

**Preview デプロイ**:
- `main` 以外のブランチ（PR等）→ Preview URL を自動生成
- 例: `https://juushin-care-system-v0-careapp8-git-fix-case-records.vercel.app`

---

## ✅ デプロイ後の確認手順

### 1. ヘルスチェック

```bash
# 本番URLにアクセス
curl https://juushin-care-system-v0-careapp8.vercel.app/

# API エンドポイント確認
curl https://juushin-care-system-v0-careapp8.vercel.app/api/staff
```

**期待結果**:
- ホームページが 200 OK で返る
- API が JSON レスポンスを返す

### 2. 認証フロー確認

1. ブラウザで本番URLを開く
2. `/login` にアクセス
3. Supabase Auth でログイン
4. ダッシュボードが表示される

### 3. データベース接続確認

```bash
# Vercel Logs で SQL クエリを確認
vercel logs --follow

# または Vercel Dashboard → Deployments → Latest → Function Logs
```

**確認ポイント**:
- Supabase 接続エラーがないか
- RLS ポリシーで拒否されていないか

### 4. PWA 機能確認

1. スマホ/タブレットで本番URLを開く
2. 「ホーム画面に追加」を実行
3. オフライン時の動作確認

### 5. パフォーマンス確認

**Lighthouse スコア**（目標）:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

```bash
# Lighthouse CI（ローカル）
npx lighthouse https://juushin-care-system-v0-careapp8.vercel.app \
  --view --chrome-flags="--headless"
```

---

## 🔧 トラブルシューティング

### ビルドエラー

**症状**: Vercel ビルドが失敗する

**確認事項**:
```bash
# ローカルでビルドテスト
pnpm build

# TypeScript エラー確認
pnpm typecheck

# Lint エラー確認
pnpm lint
```

**解決策**:
- `package.json` の `engines` を確認（Node.js バージョン）
- `.vercelignore` で不要なファイルを除外

### 環境変数エラー

**症状**: `SUPABASE_URL is not defined`

**解決策**:
1. Vercel Dashboard → Environment Variables で設定確認
2. Production/Preview/Development 全環境で設定
3. 再デプロイ実行（`vercel --prod --force`）

### Supabase 接続エラー

**症状**: `Database connection failed`

**確認事項**:
- Supabase Dashboard でプロジェクトステータス確認
- API Keys が有効か確認
- RLS ポリシーで拒否されていないか

**解決策**:
```sql
-- RLS を一時的に無効化してテスト（開発環境のみ）
ALTER TABLE case_records DISABLE ROW LEVEL SECURITY;

-- 動作確認後、必ず有効化
ALTER TABLE case_records ENABLE ROW LEVEL SECURITY;
```

### 認証エラー

**症状**: ログイン後にリダイレクトされない

**確認事項**:
- Supabase Dashboard → Authentication → URL Configuration
- Redirect URLs に本番URLを追加
  - `https://juushin-care-system-v0-careapp8.vercel.app/**`

---

## 📊 監視・ログ

### Vercel Analytics

**有効化**:
1. Vercel Dashboard → Analytics タブ
2. Enable Analytics

**確認項目**:
- ページビュー数
- Core Web Vitals（LCP, FID, CLS）
- エラー率

### Supabase Logs

**アクセス**:
Supabase Dashboard → Logs → API / Database / Auth

**確認項目**:
- SQL クエリのパフォーマンス
- RLS ポリシー違反
- 認証エラー

### エラー追跡（Sentry等を導入する場合）

```bash
# Sentry SDK インストール
pnpm add @sentry/nextjs

# next.config.ts に追加
# （詳細は Sentry ドキュメント参照）
```

---

## 🔄 ロールバック手順

### Vercel Dashboard からロールバック

1. Deployments タブ
2. 直前の成功デプロイを選択
3. **Promote to Production** をクリック

### CLI からロールバック

```bash
# デプロイ履歴確認
vercel ls

# 特定のデプロイを Production に昇格
vercel promote <deployment-url>
```

---

## 📝 本番運用チェックリスト

### デプロイ前

- [ ] `pnpm build` がローカルで成功
- [ ] `pnpm typecheck` でエラー 0
- [ ] `pnpm lint` でエラー 0
- [ ] 環境変数が Vercel に設定済み
- [ ] Supabase マイグレーション実行済み
- [ ] RLS ポリシー有効化

### デプロイ後

- [ ] 本番URLにアクセス確認
- [ ] ログイン → ダッシュボード遷移確認
- [ ] ケース記録の新規作成・保存確認
- [ ] PWA インストール確認（スマホ）
- [ ] Lighthouse スコア 90+ 確認
- [ ] Vercel Logs でエラー 0 確認

### 運用監視（毎週）

- [ ] Vercel Analytics でエラー率確認
- [ ] Supabase Database サイズ確認
- [ ] バックアップ状態確認（Supabase 自動バックアップ）
- [ ] セキュリティアラート確認（GitHub Dependabot）

---

## 🔗 関連リンク

- **Vercel Dashboard**: https://vercel.com/katoutomohiro/juushin-care-system-v0-careapp8
- **Supabase Dashboard**: https://supabase.com/dashboard/project/rlopopbtdydqchiifxla
- **GitHub Repository**: https://github.com/katoutomohiro/juushin-care-system-v0-careapp8
- **本番URL**: https://juushin-care-system-v0-careapp8.vercel.app

---

**End of Document**  
*次回更新: デプロイ時またはアーキテクチャ変更時*
