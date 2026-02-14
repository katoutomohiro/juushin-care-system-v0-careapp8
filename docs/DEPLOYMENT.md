# 本番チE�EロイメントガイチE

**対象**: 重忁E��ア支援アプリ v0  
**更新日**: 2026年1朁E8日  
**構�E**: Vercel (Next.js) + Supabase (PostgreSQL + Auth)

---

## 📐 本番構�EアーキチE��チャ

```
[ユーザー�E�スマ�E/タブレチE��/PC�E�]
         ↁE
[Vercel Edge Network]
         ↁE
[Next.js App (Vercel Functions)]
         ↁE
[Supabase (PostgreSQL + Auth + Storage)]
```

### コンポ�EネンチE

| コンポ�EネンチE| 役割 | 技術スタチE�� |
|--------------|------|------------|
| **フロントエンチE* | PWA + UI | Next.js 15 + React 19 + Tailwind CSS |
| **API Routes** | サーバ�EロジチE�� | Next.js API Routes (Vercel Functions) |
| **チE�Eタベ�Eス** | 永続化層 | Supabase PostgreSQL |
| **認証** | ユーザー管琁E| Supabase Auth |
| **ファイルストレージ** | 画像�E添仁E| Vercel Blob また�E Supabase Storage |
| **CDN** | 静的アセチE��配信 | Vercel Edge Network |

---

## 🔐 忁E��な環墁E��数

### Vercel 環墁E��数設宁E

**Production / Preview / Development 全環墁E��設宁E*:

```bash
# Supabase 接続情報�E�忁E��！E
NEXT_PUBLIC_SUPABASE_URL=https://rlopopbtdydqchiifxla.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...�E�Eupabase Dashboard から取得！E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...�E�管琁E��E��限、秘匿惁E���E�E
SUPABASE_URL=https://rlopopbtdydqchiifxla.supabase.co

# 認証バイパス�E�開発専用、本番では設定しなぁE��E
# AUTH_BYPASS=true  # ⚠�E�E本番では絶対に true にしなぁE

# チE��チE���E�開発専用�E�E
# DEBUG_MIDDLEWARE=true  # 本番では false また�E未設宁E

# Vercel Blob�E�オプション、画像保存に使用する場合！E
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...�E�Eercel Dashboard から取得！E

# OpenAI API�E�音声認識�EAI機�Eを使ぁE��合！E
OPENAI_API_KEY=sk-...�E�EpenAI Dashboard から取得！E

# Next.js 設宁E
NODE_ENV=production
```

### 環墁E��数の設定場所

**Vercel Dashboard**:
1. プロジェクト�Eージ ↁESettings ↁEEnvironment Variables
2. 吁E��数めE**Production**, **Preview**, **Development** で個別設宁E
3. 秘匿惁E���E�EERVICE_ROLE_KEY等）�E **Encrypted** にチェチE��

**ローカル開発**:
- `.env.local` に設定（リポジトリに含めなぁE��E
- `.env.example` をコピ�Eして作�E

---

## 🚀 チE�Eロイ手頁E

### 初回チE�Eロイ�E�Eercel プロジェクト作�E�E�E

#### 1. Vercel プロジェクト作�E

```bash
# Vercel CLI インスト�Eル�E�未インスト�Eルの場合！E
npm i -g vercel

# プロジェクトルートで実衁E
cd c:\dev\juushin-care-system-v0-careapp8
vercel

# 対話型で以下を選抁E
# - Set up and deploy? Yes
# - Which scope? katoutomohiro�E�個人アカウント！E
# - Link to existing project? No
# - Project name: juushin-care-system-v0-careapp8
# - In which directory is your code located? ./
# - Want to override settings? No
```

#### 2. 環墁E��数設定！Eercel Dashboard�E�E

https://vercel.com/katoutomohiro/juushin-care-system-v0-careapp8/settings/environment-variables

上記「忁E��な環墁E��数」をすべて設宁E

#### 3. Supabase プロジェクト準備

**Supabase Dashboard**: https://supabase.com/dashboard

1. **マイグレーション実衁E*:
   ```bash
   # ローカルで Supabase CLI を使用
   npx supabase db push
   
   # また�E SQL Editor で手動実衁E
   # supabase/migrations/*.sql を頁E��に実衁E
   ```

2. **RLS ポリシー確誁E*:
   - `care_receivers`, `case_records`, `services`, `staff` チE�Eブルの RLS が有効
   - 認証ユーザーのみアクセス可能なポリシー設宁E

3. **初期チE�Eタ投�E**:
   ```sql
   -- services チE�Eブル
   INSERT INTO services (id, name, slug) VALUES
     (gen_random_uuid(), '生活介護', 'life-care'),
     (gen_random_uuid(), '放課後等デイサービス', 'after-school');
   
   -- care_receivers チE�Eブル�E�サンプル�E�E
   INSERT INTO care_receivers (id, code, name, display_name, service_id)
   VALUES (gen_random_uuid(), 'AT', 'A・T', 'A・Tさん', 
     (SELECT id FROM services WHERE slug = 'life-care' LIMIT 1));
   ```

#### 4. 初回チE�Eロイ実衁E

```bash
# Production チE�Eロイ
vercel --prod

# チE�EロイURL確認（侁E https://juushin-care-system-v0-careapp8.vercel.app�E�E
```

---

### 継続的チE�Eロイ�E�EitHub 連携後！E

#### GitHub 連携設宁E

1. **Vercel Dashboard** ↁESettings ↁEGit
2. **Connect Git Repository** ↁEGitHub ↁE`katoutomohiro/juushin-care-system-v0-careapp8`
3. **Production Branch**: `main`
4. **Deploy Hooks**: 有効匁E

#### 自動デプロイフロー

```
main ブランチへ push/merge
  ↁE
Vercel が�E動検知
  ↁE
ビルド実行！Enpm build�E�E
  ↁE
チE�Eロイ�E�Eroduction�E�E
  ↁE
ヘルスチェチE��
  ↁE
本番URL更新
```

**Preview チE�Eロイ**:
- `main` 以外�EブランチE��ER等）�E Preview URL を�E動生戁E
- 侁E `https://juushin-care-system-v0-careapp8-git-fix-case-records.vercel.app`

---

## ✁EチE�Eロイ後�E確認手頁E

### 1. ヘルスチェチE��

```bash
# 本番URLにアクセス
curl https://juushin-care-system-v0-careapp8.vercel.app/

# API エンド�Eイント確誁E
curl https://juushin-care-system-v0-careapp8.vercel.app/api/staff
```

**期征E��果**:
- ホ�Eムペ�EジぁE200 OK で返る
- API ぁEJSON レスポンスを返す

### 2. 認証フロー確誁E

1. ブラウザで本番URLを開ぁE
2. `/login` にアクセス
3. Supabase Auth でログイン
4. ダチE��ュボ�Eドが表示されめE

### 3. チE�Eタベ�Eス接続確誁E

```bash
# Vercel Logs で SQL クエリを確誁E
vercel logs --follow

# また�E Vercel Dashboard ↁEDeployments ↁELatest ↁEFunction Logs
```

**確認�EインチE*:
- Supabase 接続エラーがなぁE��
- RLS ポリシーで拒否されてぁE��ぁE��

### 4. PWA 機�E確誁E

1. スマ�E/タブレチE��で本番URLを開ぁE
2. 「�Eーム画面に追加」を実衁E
3. オフライン時�E動作確誁E

### 5. パフォーマンス確誁E

**Lighthouse スコア**�E�目標！E
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

```bash
# Lighthouse CI�E�ローカル�E�E
npx lighthouse https://juushin-care-system-v0-careapp8.vercel.app \
  --view --chrome-flags="--headless"
```

---

## 🔧 トラブルシューチE��ング

### ビルドエラー

**痁E��**: Vercel ビルドが失敗すめE

**確認事頁E*:
```bash
# ローカルでビルドテスチE
pnpm build

# TypeScript エラー確誁E
pnpm typecheck

# Lint エラー確誁E
pnpm lint
```

**解決筁E*:
- `package.json` の `engines` を確認！Eode.js バ�Eジョン�E�E
- `.vercelignore` で不要なファイルを除夁E

### 環墁E��数エラー

**痁E��**: `SUPABASE_URL is not defined`

**解決筁E*:
1. Vercel Dashboard ↁEEnvironment Variables で設定確誁E
2. Production/Preview/Development 全環墁E��設宁E
3. 再デプロイ実行！Evercel --prod --force`�E�E

### Supabase 接続エラー

**痁E��**: `Database connection failed`

**確認事頁E*:
- Supabase Dashboard でプロジェクトスチE�Eタス確誁E
- API Keys が有効か確誁E
- RLS ポリシーで拒否されてぁE��ぁE��

**解決筁E*:
```sql
-- RLS を一時的に無効化してチE��ト（開発環墁E�Eみ�E�E
ALTER TABLE case_records DISABLE ROW LEVEL SECURITY;

-- 動作確認後、忁E��有効匁E
ALTER TABLE case_records ENABLE ROW LEVEL SECURITY;
```

### 認証エラー

**痁E��**: ログイン後にリダイレクトされなぁE

**確認事頁E*:
- Supabase Dashboard ↁEAuthentication ↁEURL Configuration
- Redirect URLs に本番URLを追加
  - `https://juushin-care-system-v0-careapp8.vercel.app/**`

---

## 📊 監視�Eログ

### Vercel Analytics

**有効匁E*:
1. Vercel Dashboard ↁEAnalytics タチE
2. Enable Analytics

**確認頁E��**:
- ペ�Eジビュー数
- Core Web Vitals�E�ECP, FID, CLS�E�E
- エラー玁E

### Supabase Logs

**アクセス**:
Supabase Dashboard ↁELogs ↁEAPI / Database / Auth

**確認頁E��**:
- SQL クエリのパフォーマンス
- RLS ポリシー違反
- 認証エラー

### エラー追跡�E�Eentry等を導�Eする場合！E

```bash
# Sentry SDK インスト�Eル
pnpm add @sentry/nextjs

# next.config.ts に追加
# �E�詳細は Sentry ドキュメント参照�E�E
```

---

## 🔄 ロールバック手頁E

### Vercel Dashboard からロールバック

1. Deployments タチE
2. 直前�E成功チE�Eロイを選抁E
3. **Promote to Production** をクリチE��

### CLI からロールバック

```bash
# チE�Eロイ履歴確誁E
vercel ls

# 特定�EチE�EロイめEProduction に昁E��
vercel promote <deployment-url>
```

---

## 📝 本番運用チェチE��リスチE

### チE�Eロイ剁E

- [ ] `pnpm build` がローカルで成功
- [ ] `pnpm typecheck` でエラー 0
- [ ] `pnpm lint` でエラー 0
- [ ] 環墁E��数ぁEVercel に設定済み
- [ ] Supabase マイグレーション実行済み
- [ ] RLS ポリシー有効匁E

### チE�Eロイ征E

- [ ] 本番URLにアクセス確誁E
- [ ] ログイン ↁEダチE��ュボ�Eド�E移確誁E
- [ ] ケース記録の新規作�E・保存確誁E
- [ ] PWA インスト�Eル確認（スマ�E�E�E
- [ ] Lighthouse スコア 90+ 確誁E
- [ ] Vercel Logs でエラー 0 確誁E

### 運用監視（毎週�E�E

- [ ] Vercel Analytics でエラー玁E��誁E
- [ ] Supabase Database サイズ確誁E
- [ ] バックアチE�E状態確認！Eupabase 自動バチE��アチE�E�E�E
- [ ] セキュリチE��アラート確認！EitHub Dependabot�E�E

---

## 🔗 関連リンク

- **Vercel Dashboard**: https://vercel.com/katoutomohiro/juushin-care-system-v0-careapp8
- **Supabase Dashboard**: https://supabase.com/dashboard/project/rlopopbtdydqchiifxla
- **GitHub Repository**: https://github.com/katoutomohiro/juushin-care-system-v0-careapp8
- **本番URL**: https://juushin-care-system-v0-careapp8.vercel.app

---

**End of Document**  
*次回更新: チE�Eロイ時また�EアーキチE��チャ変更晁E

