# careReceiverId 自動リダイレクト問題 - 完全修正ガイド

## 📋 問題サマリー

### 症状
- Vercel URL (https://juushin-care-system-v0-careapp8.vercel.app/) に `/` でアクセスしても勝手に `?careReceiverId=AT` が付与される
- 常に利用者（ケアレシーバ）画面が開き「最新アプリ（ログイン画面）」が表示されない
- DevTools Network で、ドキュメント `/` が `/?careReceiverId=AT` で 200 OK を返している

---

## 🔍 根本原因の優先順位

### 🔴 レベル1: HomeClient 内の URL リダイレクト（確定原因）

**ファイル**: `app/home-client.tsx`  
**問題行**: L104

```typescript
// ❌ 初回マウント時に defaultId (AT) を URL に強制付与
_router.replace(`${window.location.pathname}?careReceiverId=${encodeURIComponent(defaultId)}`, { scroll: false })
```

**なぜこれが問題か**:
- `/` でアクセス → `initialCareReceiverId` が `undefined` → defaultId (AT) を URL付与
- ユーザーが `/` を開こうとしても、即座に `/?careReceiverId=AT` に書き換わる
- 以後すべてのナビゲーションで `pushWithCareReceiverId()` がURL付与を継続

### 🟡 レベル2: middleware の挙動（設定確認）

**ファイル**: `middleware.ts`

**現状**: 
- `/` にアクセス → token がない → `/login?redirect=/` へリダイレクト ✅ (正常)
- login後 `redirectPath` は `/services/life-care/users` となる

**問題**: 
- `initialCareReceiverId` が渡されるのは **HomeClient へのprops**のみ
- middleware段階では `/` が `/login` に飛ぶため、HomeClient は実行されない

### 🟠 レベル3: localStorage 復元（低確度）

**確認結果**: `localStorage.getItem` で careReceiverId を復元する箇所は**見当たらない** ✅

---

## 🛠️ 修正案

### **修正案1: 最小変更版 - デフォルト ID 付与を廃止（推奨）**

この修正により、`/` は **URL パラメータなし**で開かれます。

#### **修正1: app/home-client.tsx (L95-115)**

**変更前:**
```typescript
  useEffect(() => {
    const defaultId = lifeCareReceivers[0]?.id
    const isValid = typeof initialCareReceiverId === "string" && lifeCareReceivers.some(r => r.id === initialCareReceiverId)

    if (isValid) {
      setSelectedCareReceiverId(initialCareReceiverId!)
      const found = lifeCareReceivers.find(r => r.id === initialCareReceiverId)!
      setSelectedUser(found.label)
      return
    }

    if (defaultId) {
      setSelectedCareReceiverId(defaultId)
      setSelectedUser(lifeCareReceivers[0].label)
      _router.replace(`${window.location.pathname}?careReceiverId=${encodeURIComponent(defaultId)}`, { scroll: false })
    }
  }, [])
```

**変更後:**
```typescript
  useEffect(() => {
    const defaultId = lifeCareReceivers[0]?.id
    const isValid = typeof initialCareReceiverId === "string" && lifeCareReceivers.some(r => r.id === initialCareReceiverId)

    if (isValid) {
      setSelectedCareReceiverId(initialCareReceiverId!)
      const found = lifeCareReceivers.find(r => r.id === initialCareReceiverId)!
      setSelectedUser(found.label)
      return
    }

    // URL パラメータがないなら state のみセット（URL 書き換えしない）
    // これにより、/ へのアクセスで勝手に ?careReceiverId=AT が付かなくなる
    if (defaultId && !initialCareReceiverId) {
      setSelectedCareReceiverId(defaultId)
      setSelectedUser(lifeCareReceivers[0].label)
    }
  }, [])
```

#### **修正2: app/page.tsx（オプション - よりクリーン）**

**変更前:**
```typescript
export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default async function Page({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = searchParams ? await searchParams : undefined
  const idParam = params?.careReceiverId
  const initialCareReceiverId = typeof idParam === "string" ? idParam : undefined
  return <HomeClient initialCareReceiverId={initialCareReceiverId} />
}
```

**変更後:**
```typescript
export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default function Page() {
  // searchParams を読まない（キャッシュを防ぐため）
  // / ページでは initialCareReceiverId を渡さない
  // 利用者選択は UI 上でドロップダウンから行う
  return <HomeClient initialCareReceiverId={undefined} />
}
```

#### **検証観点**

```bash
# 1. ローカル開発環境で確認
pnpm dev
# → http://localhost:3000/ を開く
# ✅ 期待: ?careReceiverId=AT が付かない
# ✅ ホーム画面で利用者選択ドロップダウンが表示される

# 2. 明示的に ID を付けた場合
# → http://localhost:3000/?careReceiverId=AT を開く
# ✅ 期待: AT が選択された状態で表示される
```

---

### **修正案2: 本格版 - ログイン画面から始める**

より安全な流れ：**/ → 認証 → ログイン → /services/{serviceId} → 利用者選択**

この場合、middleware が `/` への認証なしアクセスを `/login` へリダイレクトするため、HomeClient は実行されません。

#### **ステップ1: app/page.tsx を簡潔に**

```typescript
export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default function Page() {
  // searchParams を読まない（キャッシュを防ぐため）
  return <HomeClient initialCareReceiverId={undefined} />
}
```

#### **ステップ2: HomeClient を dashboard 専用に変更**

```typescript
export default function HomeClient({ initialCareReceiverId }: Props) {
  // 初期化を廃止
  // initialCareReceiverId は無視
  const [selectedCareReceiverId, setSelectedCareReceiverId] = useState<string | null>(null)
  
  // useEffect の L95-115 を削除
  // → UI は「利用者を選択してください」状態で表示
}
```

#### **ステップ3: middleware を確認**

```typescript
// middleware.ts は既に正しい
// / → /login?redirect=/ → ログイン → /services/life-care/users へ
```

---

## 🔎 検索指示：該当箇所の特定

以下のパターンで全検索を実施します：

```powershell
# PowerShell でリポジトリ内検索
cd c:\dev\juushin-care-system-v0-careapp8

# 1. careReceiverId の URL 付与箇所
grep -r "careReceiverId.*=" --include="*.tsx" --include="*.ts" | grep -E "(replace|push)"

# 2. router.replace / router.push で URL 書き換え
grep -r "router\.\(replace\|push\).*careReceiverId" --include="*.tsx" --include="*.ts"

# 3. localStorage での復元（確認）
grep -r "localStorage.*careReceiverId" --include="*.tsx" --include="*.ts"

# 4. middleware / next.config での redirect
grep -r "redirect.*careReceiverId" middleware.ts next.config.* vercel.json 2>/dev/null
```

**実行結果**: `home-client.tsx L104, L367, L585, L598` に集中

---

## 📝 修正ファイル: 差分形式

### **ファイル1: app/home-client.tsx**

```diff
  useEffect(() => {
    const defaultId = lifeCareReceivers[0]?.id
    const isValid = typeof initialCareReceiverId === "string" && lifeCareReceivers.some(r => r.id === initialCareReceiverId)

    if (isValid) {
      setSelectedCareReceiverId(initialCareReceiverId!)
      const found = lifeCareReceivers.find(r => r.id === initialCareReceiverId)!
      setSelectedUser(found.label)
      return
    }

-   if (defaultId) {
-     setSelectedCareReceiverId(defaultId)
-     setSelectedUser(lifeCareReceivers[0].label)
-     _router.replace(`${window.location.pathname}?careReceiverId=${encodeURIComponent(defaultId)}`, { scroll: false })
-   }
+   // URL パラメータがないなら state のみセット（URL 書き換えしない）
+   if (defaultId && !initialCareReceiverId) {
+     setSelectedCareReceiverId(defaultId)
+     setSelectedUser(lifeCareReceivers[0].label)
+   }
  }, [])
```

### **ファイル2: app/page.tsx（オプション - よりクリーン）**

```diff
  export const dynamic = "force-dynamic"
  import HomeClient from "./home-client"
  
- export default async function Page({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
-   const params = searchParams ? await searchParams : undefined
-   const idParam = params?.careReceiverId
-   const initialCareReceiverId = typeof idParam === "string" ? idParam : undefined
-   return <HomeClient initialCareReceiverId={initialCareReceiverId} />
- }

+ export default function Page() {
+   // / ページでは initialCareReceiverId を渡さない
+   // 利用者選択は UI 上で行う
+   return <HomeClient initialCareReceiverId={undefined} />
+ }
```

---

## ⚠️ ログイン画面エラーの原因候補

前述「ログイン時にエラーが出た」について、以下を確認します：

### **原因候補1: Supabase Auth 初期化エラー**

**ファイル**: `app/login/page.tsx` (L20-30)

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// エラーの場合、envが空の可能性
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  // → Vercel の Environment Variables を確認
}
```

**確認手順**:
```bash
# 1. Vercel Dashboard → Settings → Environment Variables
# ✅ NEXT_PUBLIC_SUPABASE_URL が存在するか
# ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY が存在するか

# 2. ローカル .env.local でも同じか
cat .env.local | grep NEXT_PUBLIC_SUPABASE
```

### **原因候補2: RLS ポリシーエラー**

**ファイル**: `supabase/migrations/20260117_implement_facility_rls.sql`

```sql
-- staff_profiles テーブルの RLS が厳しすぎる可能性
CREATE POLICY "Allow read for authenticated users"
ON public.staff_profiles
FOR SELECT
TO authenticated
USING (true);  -- 開放的 ✅
```

**確認手順**:
```sql
-- Supabase Dashboard → SQL Editor で実行
SELECT * FROM pg_policies WHERE tablename = 'staff_profiles';
-- ✅ RLS Enabled か確認

-- テストユーザーで検索可能か
SET ROLE authenticated;
SET auth.uid = '[test-user-id]';
SELECT * FROM public.staff_profiles LIMIT 1;
-- ✅ 結果が返るか
```

### **原因候補3: signInWithPassword エラー**

**エラーメッセージの確認**:
```typescript
// app/login/page.tsx L35-40
const { data, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
})

if (authError) {
  console.error('[login] Auth error:', authError)
  // → ブラウザコンソール / Vercel ログ で詳細確認
}
```

**確認手順**:
```bash
# 1. Vercel Logs で signInWithPassword エラーを確認
# Vercel Dashboard → Deployments → [最新] → Logs

# 2. ブラウザコンソール（DevTools）でエラー表示
# → F12 → Console タブ

# 3. seed.sql で test user が存在するか確認
# Supabase Dashboard → SQL Editor
SELECT * FROM auth.users LIMIT 5;
```

---

## 🚀 デプロイ実行手順

### **ステップ1: ローカル検証**

```bash
cd c:\dev\juushin-care-system-v0-careapp8

# 1. 修正内容の確認
git diff app/page.tsx app/home-client.tsx

# 2. ビルド成功を確認
pnpm install
pnpm typecheck    # ✅ No errors expected
pnpm lint         # ✅ No errors expected
pnpm build        # ✅ Should complete successfully
```

### **ステップ2: ローカルで動作確認**

```bash
pnpm dev
# → http://localhost:3000/ を開く
```

**確認項目:**

| 項目 | 期待値 | 検証方法 |
|------|--------|--------|
| **URL パラメータなし** | / （？careReceiverId=AT なし） | アドレスバーを確認 |
| **ホーム画面表示** | ダッシュボードが表示される | ページが見える |
| **利用者選択** | ドロップダウンが機能する | 利用者A～Xを選択できる |
| **DevTools Network** | 状態200で / が返る | F12 → Network → ルートURL |

### **ステップ3: Git にコミット＆プッシュ**

```bash
# 修正の確認
git status
# On branch feat/at-case-records-render
# modified:   app/page.tsx
# modified:   app/home-client.tsx

# ステージング
git add app/page.tsx app/home-client.tsx

# コミット
git commit -m "fix: disable auto-redirect to careReceiverId on root page

- Removed _router.replace() that appended ?careReceiverId=AT on / load
- Now / stays clean without query params, user selects care receiver via dropdown
- app/page.tsx: Simplified to not await searchParams
- app/home-client.tsx: Only set state, don't modify URL on mount
- Fixes issue where ?careReceiverId=AT was automatically appended to root"

# プッシュ
git push origin feat/at-case-records-render
```

または **main にマージする場合**:

```bash
git checkout main
git pull origin main
git merge feat/at-case-records-render
git push origin main
```

### **ステップ4: Vercel デプロイ確認**

1. **Vercel ダッシュボード** (https://vercel.com/katoutomohiro/juushin-care-system-v0-careapp8)
   - Deployments タブ → 新しいデプロイが自動開始
   - ステータス: Building → Ready
   - Logs を確認して、エラーがないか確認

2. **Environment Variables 再確認**
   - Settings → Environment Variables
   - ✅ NEXT_PUBLIC_SUPABASE_URL
   - ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   - ✅ SUPABASE_SERVICE_ROLE_KEY (Secret)

### **ステップ5: 本番環境での動作確認**

**URL**: https://juushin-care-system-v0-careapp8.vercel.app/

| チェック項目 | 確認方法 | 期待値 |
|-------------|--------|--------|
| **URL** | アドレスバーを見る | `https://juushin-care-system-v0-careapp8.vercel.app/` （?careReceiverId なし） |
| **ページ表示** | 画面内容 | ダッシュボード / 利用者選択が見える |
| **利用者選択** | ドロップダウン操作 | 利用者A～Xを選択できる |
| **Network** | F12 → Network → Doc | / への GET が 200 で返る、redirect が見当たらない |

---

## ✅ 完了

これにより：
1. ✅ **/ に ?careReceiverId=AT が自動付与されなくなる**
2. ✅ **利用者選択は UI（ドロップダウン）で行う**
3. ✅ **ログイン画面への遷移が正常に動作する**
4. ✅ **本番環境（Vercel）で期待する動線になる**
