# Admin 機能有効化計画

このドキュメントは、admin パスワード認証と admin 設定パネルを本番環境で有効にするための実装手順を示します。

## 📊 現在の状態

### Admin コンポーネント
- **admin-password-auth.tsx**: ✅ 存在（234 行）
  - デフォルトパスワード: `1122` (localStorage に保存)
  - 機能: パスワード入力 → admin 権限付与
  - **現在**: managementDisabled = true で無効化

- **admin-settings.tsx**: ✅ 存在（400 行）
  - 機能: ユーザー名編集、アプリタイトル・サブタイトル編集
  - 永続化: localStorage使用（Supabase 未対応）
  - **現在**: 親コンポーネントから非表示

### Supabase RLS フレームワーク
- **staff_profiles**: admin カラムが存在（migrate 20260117）
- **RLS ポリシー**: facility_id ベースの multi-tenant 隔離
- **認証**: Supabase Auth + JWT
- **注記**: admin カラムの値は未実装（0/1 または NULL）

### 環境変数フレームワーク
- **lib/env.ts**: ✅ 存在（基本的な env vars）
- **FEATURES**: ❌ 未実装（design only）
- **ENABLE_ADMIN_FEATURES**: ❌ Vercel env vars に未登録

---

## 🎯 実装ステップ

### Step 1: lib/features.ts を作成

```typescript
// lib/features.ts
/**
 * Feature flags for Juushin Care System
 * Centralized feature control for all components
 */

export const FEATURES = {
  /**
   * Enable admin features (password auth, settings panel)
   * Set via ENABLE_ADMIN_FEATURES environment variable
   */
  ENABLE_ADMIN_FEATURES: process.env.ENABLE_ADMIN_FEATURES === 'true',
  
  /**
   * Enable staff management UI (add/edit/delete staff)
   */
  ENABLE_STAFF_MANAGEMENT: process.env.ENABLE_STAFF_MANAGEMENT === 'true',
  
  /**
   * Enable realtime sync with Supabase
   */
  ENABLE_REALTIME_SYNC: process.env.ENABLE_REALTIME_SYNC !== 'false', // default true
  
  /**
   * Enable A4 record PDF export
   */
  ENABLE_PDF_EXPORT: process.env.ENABLE_PDF_EXPORT !== 'false', // default true
  
  /**
   * Enable voice recording feature
   */
  ENABLE_VOICE_RECORDING: process.env.ENABLE_VOICE_RECORDING === 'true',
} as const

// Type safety: Ensure all features are boolean
type FeatureFlags = typeof FEATURES
type FeatureKey = keyof FeatureFlags
type FeatureValue = FeatureFlags[FeatureKey]
```

**ファイル配置:**
```
lib/features.ts
```

**テスト:**
```bash
# ローカルで確認
echo "ENABLE_ADMIN_FEATURES=false" >> .env.local
pnpm dev
# Admin セクションが非表示になること確認

echo "ENABLE_ADMIN_FEATURES=true" >> .env.local
pnpm dev
# Admin セクションが表示されることを確認
```

---

### Step 2: admin-password-auth.tsx を修正

**変更箇所:**
```typescript
// components/admin-password-auth.tsx
import { FEATURES } from '@/lib/features'

export function AdminPasswordAuth({ children }: { children: React.ReactNode }) {
  // ❌ OLD:
  // const managementDisabled = true  // hardcoded
  
  // ✅ NEW:
  const managementDisabled = !FEATURES.ENABLE_ADMIN_FEATURES
  
  if (managementDisabled) return children
  
  // ... rest of component
}
```

**確認:**
```bash
# .env.local に ENABLE_ADMIN_FEATURES=true を設定
pnpm dev
# http://localhost:3000 で admin-password-auth が表示される
```

---

### Step 3: Vercel 環境変数を設定

**Vercel Dashboard:**
1. Settings → Environment Variables
2. 新規追加: `ENABLE_ADMIN_FEATURES`
   - Value: `false` (初期状態)
   - Environments: Production, Preview, Development

**コマンド（API 経由）:**
```bash
# Vercel CLI（インストール済みの場合）
vercel env add ENABLE_ADMIN_FEATURES
# Value: false を入力
```

**確認:**
```bash
vercel env ls
# ENABLE_ADMIN_FEATURES = false と表示される
```

---

### Step 4: Initial Admin User を作成（オプション）

#### 4a. Supabase で手動作成

```sql
-- Supabase Dashboard → SQL Editor で実行

-- 1. auth.users に新規ユーザーを作成
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at, 
  last_sign_in_at, 
  raw_user_meta_data
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- UUID (一意であること)
  'admin@juushin.example.com',
  crypt('admin-secure-password-here', gen_salt('bf')),  -- bcrypt hash
  NOW(),
  NOW(),
  NOW(),
  NULL,
  '{"display_name":"System Admin"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 2. staff_profiles に紐付け
INSERT INTO public.staff_profiles (
  id, 
  auth_id,
  facility_id,
  name, 
  role, 
  admin,
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '12345678-abcd-1234-abcd-1234567890ab',  -- 実在する facility_id
  'System Admin',
  'admin',  -- 'admin' or 'user'
  1,  -- admin flag: 1 = true
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3. 確認
SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email = 'admin@juushin.example.com';
```

#### 4b. supabase/seed.sql に追加（推奨）

```sql
-- supabase/seed.sql に追加

-- Initial admin user
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@example.com',
  crypt('initial-admin-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Link to staff_profiles
INSERT INTO public.staff_profiles (
  auth_id,
  facility_id,
  name,
  role,
  admin,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '[facility_id]',
  'Admin',
  'admin',
  1,
  NOW()
)
ON CONFLICT DO NOTHING;
```

実行:
```bash
supabase db push  # migrate + seed.sql 実行
```

---

### Step 5: ローカルテスト

```bash
# 開発環境で admin 機能を有効化
echo "ENABLE_ADMIN_FEATURES=true" >> .env.local

# ローカルサーバーを起動
pnpm dev

# テスト手順
# 1. http://localhost:3000 を開く
# 2. Admin パスワード入力フィールドが表示される
# 3. デフォルトパスワード "1122" を入力
# 4. Admin Settings パネルが表示される
# 5. ユーザー名やアプリタイトルを編集してみる
# 6. localStorage に変更が保存されることを確認
```

**デバッグ:**
```bash
# localStorage の admin flag を確認
# DevTools → Application → Storage → Local Storage
# "isAdmin" キーが true になっているか
```

---

### Step 6: 本番環境にデプロイ

#### 6a. Vercel で ENABLE_ADMIN_FEATURES を有効化

1. Vercel Dashboard → Settings → Environment Variables
2. `ENABLE_ADMIN_FEATURES` → Value: `true` (Production 環境)
3. 再デプロイ

#### 6b. コード変更をコミット・プッシュ

```bash
git add lib/features.ts components/admin-password-auth.tsx
git commit -m "feat: add feature flag for admin features"
git push origin main

# Vercel が自動デプロイ開始
# Deployments で "Build success" を確認
```

#### 6c. 本番環境をテスト

```bash
# https://juushin-care-system-v0-careapp8.vercel.app/
# 1. Admin パスワード入力フィールドが表示される
# 2. "1122" を入力して Admin Settings を開く
# 3. テスト編集を行う
# 4. LocalStorage に保存されることを確認
```

---

## 🔒 セキュリティに関する注記

### 現在の実装（localStorage ベース）
- ✅ 簡単にテスト可能
- ❌ クライアント側のみ（セキュリティ上の懸念）
- ❌ サーバー側で検証されない

### 将来の改善案（Supabase RLS ベース）
```typescript
// 将来実装
// 1. admin 判定を Supabase RLS で行う
// 2. staff_profiles.admin = 1 の user のみアクセス可能
// 3. API routes で JWT を検証
// 4. localStorage ではなく session cookie を使用

// 参考: supabase/migrations/20260117_implement_facility_rls.sql
// CREATE POLICY "Admin can manage staff"
//   ON public.staff_profiles
//   FOR ALL
//   USING (
//     (
//       SELECT admin FROM public.staff_profiles 
//       WHERE auth_id = auth.uid()
//     ) = 1
//   );
```

---

## 📋 実装チェックリスト

### Step 1: lib/features.ts
- [ ] ファイルを作成
- [ ] FEATURES オブジェクトを定義
- [ ] 型定義を追加
- [ ] pnpm typecheck: ✅

### Step 2: admin-password-auth.tsx
- [ ] インポート: `import { FEATURES } from '@/lib/features'`
- [ ] managementDisabled を修正
- [ ] pnpm typecheck: ✅
- [ ] pnpm lint: ✅

### Step 3: Vercel 環境変数
- [ ] ENABLE_ADMIN_FEATURES を追加
- [ ] Value: false （初期状態）
- [ ] All environments に適用

### Step 4: Initial Admin User（オプション）
- [ ] Supabase で auth.users を作成（または seed.sql に追加）
- [ ] staff_profiles に紐付け
- [ ] admin = 1 を設定

### Step 5: ローカルテスト
- [ ] .env.local: ENABLE_ADMIN_FEATURES=true
- [ ] pnpm dev でホームページを開く
- [ ] Admin パスワード入力が表示される
- [ ] デフォルトパスワード "1122" で Admin Settings が開く
- [ ] ユーザー名を編集してみる
- [ ] localStorage に保存される

### Step 6: 本番デプロイ
- [ ] git commit & push
- [ ] Vercel ダッシュボードで Build success 確認
- [ ] ENABLE_ADMIN_FEATURES = true に変更（または後で有効化）
- [ ] https://juushin-care-system-v0-careapp8.vercel.app で確認

---

## 🚀 デプロイ後の確認

### 機能テスト
```bash
# 1. Admin パスワード入力
# - http://localhost:3000 を開く
# - Admin settings セクションが見える
# - "1122" を入力

# 2. Admin Settings パネル
# - User 1 name, User 2 name ... が編集可能
# - App Title, App Subtitle が編集可能
# - 変更が localStorage に保存される

# 3. 複数セッション テスト
# - 別ブラウザ/シークレットで開く
# - localStorage が shared でなく、各セッション独立していることを確認
```

### トラブルシューティング

**問題: Admin パスワル入力が表示されない**
```bash
# 確認項目
echo $ENABLE_ADMIN_FEATURES  # true か確認
grep "FEATURES.ENABLE_ADMIN_FEATURES" components/admin-password-auth.tsx  # コード確認
pnpm typecheck  # 型エラー確認
```

**問題: パスワードが受け付けられない**
```bash
# localhost:3000/admin-password-auth.tsx のデフォルトPW確認
grep -n "1122\|password" components/admin-password-auth.tsx

# localStorage に保存されているか確認
# DevTools → Application → Storage → Local Storage → isAdmin キー
```

**問題: 設定が保存されない**
```bash
# localStorage が有効か確認
# DevTools → Application → Storage → Local Storage が見える
# isAdmin, userNames, appTitle などのキーが存在するか
```

---

## 📚 参考リンク

- **admin-password-auth.tsx**: [components/admin-password-auth.tsx](../../components/admin-password-auth.tsx#L28)
- **admin-settings.tsx**: [components/admin-settings.tsx](../../components/admin-settings.tsx)
- **Supabase RLS**: [supabase/migrations/20260117_implement_facility_rls.sql](../../supabase/migrations/20260117_implement_facility_rls.sql)
- **環境変数設定**: [lib/env.ts](../../lib/env.ts)

---

## ✅ 完了時の状態

### ✅ 実装完了後
- [ ] Admin パスワード認証が機能
- [ ] Admin Settings で ユーザー名・タイトル編集可能
- [ ] localStorage に永続化
- [ ] ENABLE_ADMIN_FEATURES フラグで完全にコントロール可能
- [ ] 本番環境でも必要に応じて有効化/無効化可能

### 🔮 将来のアップグレード案
- [ ] Supabase RLS ベースの admin 検証
- [ ] Server actions で admin 権限をサーバー側で検証
- [ ] audit log（admin による変更履歴）
- [ ] multi-admin サポート
- [ ] Password strength 要件
- [ ] Session timeout
