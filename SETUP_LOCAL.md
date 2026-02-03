# ローカル開発環境セットアップガイド

## 前提条件

- Node.js 20+
- pnpm 9+
- Supabase アカウント (https://supabase.com)
- Git

## Step 1: リポジトリクローン

```powershell
git clone https://github.com/katoutomohiro/juushin-care-system-v0-careapp8.git
cd juushin-care-system-v0-careapp8
```

## Step 2: 依存パッケージをインストール

```powershell
pnpm install
```

## Step 3: Supabase セットアップ

### 3.1 Supabase Project を作成

1. https://supabase.com → "Start your project"
2. Organization / Project name を入力
3. Database password を設定
4. Region を選択 (東京推奨: ap-northeast-1)
5. 作成完了（5~10 分待機）

### 3.2 環境変数を設定

1. Supabase Dashboard → Settings → API
2. 以下の値をコピー:

```powershell
# .env.local を作成
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Database マイグレーション実行

```powershell
# Supabase CLI をインストール
npm install -g @supabase/cli

# ログイン
supabase login

# マイグレーション実行（ローカル）
supabase start

# または、リモート Supabase に直接実行
supabase migration up --linked

# RLS migration を実行
psql postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres < supabase/migrations/20260117_implement_facility_rls.sql
```

## Step 5: シードデータを投入

```powershell
# Supabase Dashboard → SQL Editor → New Query
# 以下を実行:
\i supabase/seed.sql

# または CLI で実行:
supabase db push --local-only
supabase seed run
```

## Step 6: Dev サーバーを起動

```powershell
pnpm run reboot

# 期待結果: Ready in 2.5s
```

## Step 7: ブラウザでアクセス

```
http://localhost:3000
```

### ログイン情報（テスト用）

| 施設 | ユーザー | Email | Password |
| --- | --- | --- | --- |
| 生活介護 | スタッフA | staff.lifecare@example.com | password123 |
| 放課後等デイサービス | スタッフB | staff.afterschool@example.com | password123 |

## 開発コマンド

```powershell
# Dev サーバー起動 (Watch mode)
pnpm dev

# Build 検証
pnpm build

# 型チェック
pnpm typecheck

# Lint 実行
pnpm lint

# テスト実行
pnpm test

# E2E テスト
pnpm test:e2e

# Clean reboot (新規セッション)
pnpm run reboot
```

## トラブルシューティング

### Dev サーバーが起動しない

```powershell
# 1. Port 3000 が使用中でないか確認
netstat -ano | findstr :3000

# 2. キャッシュをクリア
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
pnpm run reboot

# 3. Node modules を再インストール
Remove-Item node_modules, pnpm-lock.yaml -Recurse -Force -ErrorAction SilentlyContinue
pnpm install
pnpm run reboot
```

### Supabase に接続できない

```powershell
# 1. 環境変数を確認
Get-Content .env.local

# 2. Supabase ステータスを確認
# https://status.supabase.com

# 3. ネットワークを確認
ping api.supabase.co

# 4. Session を再起動
supabase logout
supabase login
```

### RLS ポリシーエラー

```bash
# 1. staff_profiles が存在するか確認
# Supabase Dashboard → Table Editor → staff_profiles

# 2. facility_id が正しく設定されているか確認
SELECT * FROM staff_profiles WHERE id = 'your-user-id';

# 3. RLS ポリシーを確認
-- Supabase Dashboard → SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'care_receivers';
```

## ディレクトリ構成

```
├── app/                        # Next.js App Router
│   ├── api/                   # API Routes
│   ├── login/                 # ログインページ
│   ├── services/              # 利用者管理ページ
│   └── ...
├── components/                # React コンポーネント
│   ├── create-care-receiver-modal.tsx
│   ├── ui/                    # shadcn/ui components
│   └── ...
├── hooks/                     # Custom React Hooks
│   ├── useRealtime.ts         # Realtime subscription
│   └── ...
├── lib/                       # Utility functions
│   ├── supabase/              # Supabase client
│   └── ...
├── middleware.ts              # Next.js middleware (auth enforcement)
├── supabase/
│   ├── migrations/            # DB migrations
│   └── seed.sql               # Test data
├── .env.example               # Environment variables template
├── .env.local                 # Local environment (git ignored)
├── next.config.mjs            # Next.js config
├── tailwind.config.ts         # Tailwind CSS config
└── tsconfig.json              # TypeScript config
```

## 主要な実装ファイル

| ファイル | 役割 |
| --- | --- |
| `middleware.ts` | 認証ガード + セッション管理 |
| `app/login/page.tsx` | ログイン / サインアップ UI |
| `app/api/care-receivers/list/route.ts` | Care receiver CRUD API |
| `hooks/useRealtime.ts` | Realtime subscription hooks |
| `supabase/migrations/20260117_implement_facility_rls.sql` | RLS ポリシー定義 |
| `supabase/seed.sql` | 24 名のテストユーザー投入 |

## 本番デプロイ

詳細は [PRODUCTION_CHECKLIST.md](./docs/PRODUCTION_CHECKLIST.md) を参照してください。

```powershell
# Vercel にデプロイ
pnpm install -g vercel
vercel

# または GitHub に push して GitHub Actions を使用
git add .
git commit -m "feat: production ready"
git push origin main
```

## サポート

質問や問題がある場合:

1. [GitHub Issues](https://github.com/katoutomohiro/juushin-care-system-v0-careapp8/issues)
2. [Supabase Discord](https://discord.supabase.com)
3. [Next.js Discord](https://discord.gg/nextjs)

---

最終更新: 2026-01-29
