# 🚀 Supabase マイグレーション実行手順

## 問題
- `care_receivers.is_active` 列が存在しない
- API が "column care_receivers.is_active does not exist" エラーを返す
- Result: **500/503 エラー**

## 解決策

### ステップ 1: Supabase Dashboard を開く

**URL:** https://app.supabase.com

![step1](https://img.shields.io/badge/Supabase-Dashboard-purple)

### ステップ 2: プロジェクト選択

| 項目 | 値 |
|------|-----|
| **プロジェクト ID** | `rlopopbtdydqchiifxla` |
| **リージョン** | ap-southeast-1 (シンガポール) |
| **URL** | https://rlopopbtdydqchiifxla.supabase.co |

### ステップ 3: SQL Editor を開く

1. 左メニュー → **SQL Editor**
2. **New Query** をクリック
3. 下の SQL をコピー

### ステップ 4: SQL を貼り付けて実行

```sql
-- Consolidate care_receivers schema
-- Add is_active for logical deletion

-- 1. Add is_active for logical deletion (default true)
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 2. Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_care_receivers_is_active 
  ON public.care_receivers(is_active);

-- 3. Create composite index on service_code + is_active for common queries
CREATE INDEX IF NOT EXISTS idx_care_receivers_service_code_active 
  ON public.care_receivers(service_code, is_active);
```

### ステップ 5: Run ボタンをクリック

![run-button](https://img.shields.io/badge/Action-Run-green)

**期待値：**

```
Query executed successfully (4 statements executed)
```

---

## ✅ 確認

実行後、以下を確認してください：

```sql
-- SQL Editor で新しい Query を開いて実行
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'care_receivers'
  AND column_name = 'is_active'
) AS column_exists;
```

**期待結果：** `column_exists = true`

---

## 🎯 次のステップ

マイグレーション完了後：

```powershell
# Windows PowerShell で以下を実行

# 1. main にチェックアウト
cd c:\dev\juushin-care-system-v0-careapp8
git checkout main
git pull origin main

# 2. 依存関係インストール
pnpm install

# 3. dev サーバ起動
pnpm dev
```

ブラウザで確認：
- http://localhost:3002/login → ログイン画面表示
- ログイン後、http://localhost:3002/services/life-care/users → ユーザー一覧表示
- DevTools Network で GET `/api/care-receivers/list?serviceCode=life-care` が **200 OK** を返す

---

## トラブルシューティング

| エラー | 原因 | 解決 |
|-------|------|------|
| "column already exists" | 既に実行済み | OK。スキップされます |
| "relation care_receivers does not exist" | テーブルが存在しない | プロジェクトIDを確認 |
| "permission denied" | RLS ポリシー | Service role key で実行 |

