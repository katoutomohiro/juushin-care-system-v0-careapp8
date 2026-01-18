# Vercel デプロイメント完全チェックリスト

## 📋 デプロイ前チェック

### 1. リポジトリ確認
- [ ] 正しいリポジトリ: katoutomohiro/juushin-care-system-v0-careapp8
- [ ] 正しいブランチ: main or feat/at-case-records-render
- [ ] GitHub に push 済み: `git log --oneline -1`

### 2. ローカルビルド確認
```bash
pnpm install
pnpm typecheck   # ✅ エラーなし
pnpm lint        # ✅ エラーなし
pnpm build       # ✅ Build success
pnpm dev         # ✅ http://localhost:3000 で / を開く
# 期待: ?careReceiverId=AT が付かない
```

### 3. Vercel Dashboard 確認
- [ ] Project: juushin-care-system-v0-careapp8
- [ ] Settings → Git → Connected Repository = katoutomohiro/juushin-care-system-v0-careapp8
- [ ] Settings → Branches → Production = main
- [ ] Settings → Environment Variables を確認:
  - [ ] NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_...
  - [ ] SUPABASE_SERVICE_ROLE_KEY = sb_secret_... (Secret として)

### 4. Vercel デプロイ実行
- [ ] git push origin main
- [ ] Vercel ダッシュボードで自動デプロイ開始確認
- [ ] Deployments → [最新] → Logs で Build Success 確認

### 5. 本番環境での動作確認
- [ ] https://juushin-care-system-v0-careapp8.vercel.app/ へアクセス
- [ ] シークレットウィンドウで確認（キャッシュなし）
- [ ] DevTools → Network で、/ へのリクエストが 200 OK で返る
- [ ] URL バーに ?careReceiverId=AT が付いていない
- [ ] ホーム画面が表示される
- [ ] 利用者選択ドロップダウンが機能する

### 6. キャッシュクリア（必要に応じて）
```bash
# Vercel Dashboard → Deployments → [最新] → More → Redeploy
# → "Redeploy without cache" を選択
```

### 7. HTTP ヘッダ確認（問題時のデバッグ）
```bash
curl -I https://juushin-care-system-v0-careapp8.vercel.app/
# 確認項目:
# - x-vercel-id: [id] (デプロイID)
# - x-vercel-cache: HIT / MISS (キャッシュ状態)
# - cache-control: (キャッシュ制御)
```

---

## 🔧 問題が発生した場合のトラブルシュート

### 問題: それでも ?careReceiverId=AT が付く

**確認項目:**

```bash
# 1. キャッシュをクリア
#    Vercel Dashboard → Deployments → [最新] → More → "Redeploy (no cache)"

# 2. ローカルビルドで確認
pnpm clean  # キャッシュ削除
pnpm build
pnpm start

# 3. browser cache をクリア
#    DevTools → Application → Storage → Clear site data

# 4. 別ブラウザまたはシークレットで確認
```

### 問題: ログイン画面でエラー

**確認項目:**

```bash
# 1. Supabase 認証情報を確認
#    .env.local が正しいか
#    Vercel Environment Variables が設定されているか

cat .env.local | grep SUPABASE

# 2. Supabase seed データを確認
#    Supabase Dashboard → SQL Editor
SELECT COUNT(*) FROM auth.users;  -- 0 なら seed 実行が必要

# 3. ログを確認
#    Vercel Dashboard → Deployments → [最新] → Logs
#    "error" で検索
```

### 問題: 利用者選択ドロップダウンが動作しない

**確認項目:**

```bash
# 1. lifeCareReceivers が定義されているか確認
grep -n "lifeCareReceivers" app/home-client.tsx

# 2. CareReceiverSelect コンポーネントを確認
grep -rn "CareReceiverSelect" app/

# 3. DevTools Console でエラーを確認
#    F12 → Console タブで JavaScript エラーを見る
```

---

## 🔐 ログイン エラー診断

### A. Supabase 接続確認

- [ ] NEXT_PUBLIC_SUPABASE_URL が有効なSupabase URLか
  ```bash
  echo $NEXT_PUBLIC_SUPABASE_URL
  # 期待: https://xxxxx.supabase.co (xxxx は16文字の英数字)
  ```

- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY が有効か
  ```bash
  # Supabase Dashboard → Settings → API → anon public key
  # Vercel Environment Variables と一致するか
  ```

### B. Seed データ確認

- [ ] auth.users にテストユーザーがいるか
  ```sql
  -- Supabase Dashboard → SQL Editor
  SELECT COUNT(*) FROM auth.users;
  -- 結果が 0 なら: supabase/seed.sql を実行
  ```

- [ ] staff_profiles にレコードがあるか
  ```sql
  SELECT * FROM public.staff_profiles LIMIT 5;
  -- role が 'admin' または 'user' であること
  ```

### C. RLS ポリシー確認

- [ ] RLS が enabled か
  ```sql
  SELECT tablename FROM pg_tables 
  WHERE schemaname = 'public' AND tablename IN ('auth.users', 'staff_profiles');
  ```

- [ ] RLS ポリシーがエラーを返していないか
  ```sql
  -- Supabase Dashboard → SQL Editor
  -- テストユーザーで検索可能か
  SET ROLE authenticated;
  SET auth.uid = '[test-user-id-uuid]';
  SELECT * FROM public.staff_profiles LIMIT 1;
  ```

### D. ログインフロー確認

- [ ] app/login/page.tsx で signInWithPassword が呼ばれているか
- [ ] 正しい email/password でログインテスト
  ```
  Email: [seed.sql に記載のメール]
  Password: [seed.sql に記載のパスワード]
  ```

- [ ] エラーが出る場合、DevTools Console で詳細を確認
  ```
  F12 → Console → Error メッセージをコピー
  Vercel Logs と対照
  ```

### E. 環境変数の final 確認

- [ ] Vercel Dashboard で以下が設定されているか:
  - NEXT_PUBLIC_SUPABASE_URL ✅
  - NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
  - SUPABASE_SERVICE_ROLE_KEY ✅ (Secret として)

- [ ] .env.local（開発環境）と一致しているか

### F. キャッシュクリア

- [ ] Vercel: Redeploy without cache
- [ ] ブラウザ: Ctrl+Shift+Delete で全キャッシュ削除
- [ ] Supabase: SQL Editor で VACUUM を実行（オプション）

### G. ログ確認

- [ ] Vercel ダッシュボード → Deployments → [最新] → Logs
  - "error", "Auth", "signup" で検索
  
- [ ] Supabase Dashboard → Logs
  - API calls, Auth, Database errors を確認

### H. 最後の手段

- [ ] seed.sql を再実行
- [ ] Supabase プロジェクトをリセット（開発環境のみ）
- [ ] Vercel を新規デプロイ

---

## ✅ 最終確認チェックリスト

### Before Deploy
- [ ] app/page.tsx が async でない (changed to sync)
- [ ] app/home-client.tsx の L104 _router.replace が削除されている
- [ ] pnpm typecheck: ✅ No errors
- [ ] pnpm lint: ✅ No errors
- [ ] pnpm build: ✅ Build success
- [ ] ローカル pnpm dev で / が ?careReceiverId=AT 付かない

### Deploy
- [ ] git push origin [branch]
- [ ] Vercel ダッシュボード: Deployments に新しいデプロイ
- [ ] Build & Deployment: Ready

### After Deploy
- [ ] https://juushin-care-system-v0-careapp8.vercel.app/ を開く
- [ ] 【重要】 / に ?careReceiverId=AT が付いていない
- [ ] ダッシュボード表示（利用者選択ドロップダウンが見える）
- [ ] 利用者選択ドロップダウンで A～X を選択できる
- [ ] DevTools Network で:
  - Status 200
  - x-vercel-id: [id]
  - Query String: 空
- [ ] ログイン機能テスト（必要に応じて）

### If Any Issue
1. Vercel Redeploy without cache
2. Browser cache clear (Ctrl+Shift+Delete)
3. ブラウザ再起動
4. 上記の"トラブルシュート"セクションを参照

---

## 🎯 最短デプロイコマンド（まとめ）

```bash
# ローカル最終確認
pnpm typecheck && pnpm lint && pnpm build

# Git操作
git add app/page.tsx app/home-client.tsx
git commit -m "fix: remove auto-redirect to careReceiverId on root page"

# Vercel へ自動デプロイ
git push origin main

# 本番環境で確認
# https://juushin-care-system-v0-careapp8.vercel.app/ を開く
# ✅ / に ?careReceiverId=AT が付かないことを確認
```
