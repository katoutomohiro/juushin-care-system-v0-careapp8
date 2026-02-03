# 本番環境対応チェックリスト

> **完了条件**:
> - localhost を使わずブラウザから本番 URL で正常動作
> - 利用者管理に全 24 名が表示
> - 編集・追加・削除が即時反映
> - 接続エラーが発生しない

## ✅ Phase 1: ローカル検証 (dev サーバー)

### 1.1 認証ミドルウェアテスト

```bash
# Step 1: dev サーバーをリセット
pnpm run reboot

# Step 2: ブラウザで http://localhost:3000 にアクセス
# 期待結果: /login ページへ自動リダイレクト

# Step 3: 無効な認証情報でログイン試行
# Email: invalid@example.com
# Password: wrongpassword
# 期待結果: エラーメッセージ「ログインに失敗しました」表示
```

### 1.2 ログイン → スタッフプロフィール検証

```bash
# Step 1: 有効なテストアカウントでログイン
# Email: staff.lifecare@example.com
# Password: [seed.sql に定義されたパスワード]

# Step 2: ログイン後のリダイレクト
# 期待結果: /services/life-care/users ページへ自動遷移

# Step 3: ブラウザコンソールでエラー確認
# 期待結果: CORS エラーなし、Supabase API エラーなし
```

### 1.3 利用者一覧表示 (RLS フィルタリング)

```bash
# Step 1: ブラウザで /services/life-care/users ページ表示
# 期待結果:
#   - 「生活介護」セクション表示
#   - 利用者数: 14 名（life-care facility の users のみ）
#   - コンポーネント表示: CreateCareReceiverModal, refresh button

# Step 2: 「放課後等デイサービス」セクション確認
# 期待結果:
#   - セクション表示
#   - 利用者数: 10 名（after-school facility の users のみ）

# Step 3: 合計確認
# 期待結果: 14 + 10 = 24 名が表示
```

### 1.4 API 認証テスト

```bash
# Step 1: ブラウザコンソールで API 直接呼び出し
fetch('/api/care-receivers/list?serviceCode=life-care', { cache: 'no-store' })
  .then(r => r.json())
  .then(d => console.log(d))

# 期待結果:
# {
#   ok: true,
#   users: [...14 users...],
#   count: 14
# }

# Step 2: 認証なしアクセステスト
# ブラウザで新規シークレット窓を開く → localhost:3000 → /login へリダイレクト確認
# 期待結果: セッション切れで /login へ強制遷移
```

### 1.5 RLS 強制テスト

```bash
# Step 1: ブラウザコンソールで、別 facility のユーザー削除を試行
const facilityId = 'after-school-facility-id'
const careReceiverId = 'life-care-user-id'
fetch(`/api/care-receivers/[${careReceiverId}]`, {
  method: 'DELETE',
  cache: 'no-store'
})
.then(r => r.json())
.then(d => console.log(d))

# 期待結果:
# {
#   ok: false,
#   error: "Not found or access denied",
#   status: 404 (RLS により削除権限なし)
# }
```

### 1.6 Realtime 同期テスト

```bash
# Step 1: ブラウザで 2 つの窓を開く
# Window 1: ログイン → /services/life-care/users
# Window 2: ログイン → /services/life-care/users

# Step 2: Window 1 で利用者追加
# CreateCareReceiverModal で新規利用者追加 → "保存" クリック

# Step 3: Window 2 での反映確認
# 期待結果: 手動リフレッシュなしに新規利用者が即座に表示される
# 実装: useRealtimeCareReceivers() → router.refresh() 自動実行
```

### 1.7 エラーハンドリング確認

```bash
# Step 1: ネットワーク遮断テスト
# DevTools → Network → Offline に設定 → ページ再読み込み

# 期待結果:
# - ローカル cache または IndexedDB からデータ表示（フォールバック）
# - または明確なエラーメッセージ表示（通信エラー）

# Step 2: Supabase ダウンシミュレーション
# .env.local の NEXT_PUBLIC_SUPABASE_URL を無効な値に変更
# ページ再読み込み

# 期待結果:
# - HTTP 500 エラーメッセージ表示
# - エラーログ: "[GET /api/care-receivers] Supabase query error"
```

## ✅ Phase 2: Vercel デプロイ前準備

### 2.1 環境変数確認

```bash
# Step 1: .env.local ファイルを確認
cat .env.local

# 必須変数:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY (オプション, admin API 用)

# Step 2: localhost 参照を削除
grep -r "localhost:3000" --include="*.ts" --include="*.tsx" --include="*.js"

# 期待結果: ビルドスクリプト以外にマッチなし
```

### 2.2 ビルド検証

```bash
pnpm run build

# 期待結果:
# ✓ Built successfully
# ✓ No errors
# ✓ Page files: 45+
# ✓ Static assets: 120+
```

### 2.3 型チェック + Lint 検証

```bash
pnpm typecheck
pnpm lint

# 期待結果:
# ✓ TypeScript types valid
# ✓ ESLint: 0 errors
# ✓ ESLint: warnings acceptable (non-critical)
```

### 2.4 テスト実行

```bash
pnpm test:unit   # Vitest
pnpm test:e2e    # Playwright

# 期待結果: すべてのテストが PASS
# または既知の skip テストのみ SKIP
```

## ✅ Phase 3: Vercel にデプロイ

### 3.1 Vercel CLI でプレビュー

```bash
pnpm install -g vercel
vercel

# 対話的に:
# ? Set up and deploy ~/path/to/juushin-care-system-v0-careapp8? yes
# ? Which scope? (your-org)
# ? Link to existing project? no
# ? What's your project name? juushin-care-system
# ? In which directory is your code? .
# ? Want to modify these settings before deploying? no

# 期待結果: Preview URL が生成される (e.g., https://juushin-care-system-abc123.vercel.app)
```

### 3.2 Vercel プレビュー環境変数設定

```bash
# Step 1: Vercel Dashboard → Settings → Environment Variables

# 環境変数を設定:
NEXT_PUBLIC_SUPABASE_URL = [your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key] (SENSITIVE)

# Step 2: Redeploy
vercel --prod

# Step 3: Preview URL で上記テスト (Phase 1.1 ~ 1.7) を再実行
```

### 3.3 本番ドメイン設定 (カスタム URL)

```bash
# Step 1: Vercel Dashboard → Domains → Add
# ドメイン例: care-system.example.com

# Step 2: DNS 設定 (ドメインレジストラで)
# CNAME record:
# care-system.example.com → cname.vercel.sh

# Step 3: Vercel で確認
# ? Domain connected? yes

# Step 4: HTTPS が自動有効化される (Let's Encrypt)
# 期待結果: https://care-system.example.com で接続可能
```

## ✅ Phase 4: 本番確認

### 4.1 本番環境でのログインテスト

```bash
# Step 1: ブラウザで https://care-system.example.com (本番 URL) にアクセス
# 期待結果: /login にリダイレクト

# Step 2: スタッフアカウントでログイン
# Email: staff.lifecare@example.com
# Password: [password]
# 期待結果: /services/life-care/users ページへ遷移

# Step 3: ブラウザコンソールで API テスト
fetch('/api/care-receivers/list?serviceCode=life-care')
  .then(r => r.json())
  .then(d => console.log(d.count))

# 期待結果: 14
```

### 4.2 マルチユーザー同時接続テスト

```bash
# Step 1: 2 つのブラウザ (or 別ユーザー) で同時ログイン
# Browser A: staff.lifecare@example.com → life-care facility
# Browser B: staff.afterschool@example.com → after-school facility

# Step 2: Browser A でユーザー編集
# ユーザー "太郎" → "太郎 (編集済み)" に変更 → 保存

# Step 3: Browser A での反映確認
# 期待結果: リアルタイムで変更が表示される (Realtime subscription)

# Step 4: Browser B での確認
# 期待結果: Browser B では after-school facility のユーザーのみ表示
# Browser A の life-care ユーザー変更は Browser B に影響しない
```

### 4.3 セキュリティ確認

```bash
# Step 1: RLS ポリシー確認
# Supabase Dashboard → Authentication → Users
# 2 つのテストアカウントの facility_id が異なることを確認

# Step 2: スポーフィング試行
# Browser A で API 直接呼び出し:
fetch('/api/care-receivers/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'HACKER-001',
    name: 'Hacker',
    service_code: 'after-school',  // Browser A は life-care facility
    facility_id: 'after-school-facility-id'  // 別 facility に入力
  })
})

# 期待結果: HTTP 201 だが、facility_id は自動的に life-care に上書きされる
# (server side で profile.facility_id を強制)
```

### 4.4 障害時対応確認

```bash
# Step 1: Supabase を一時的に停止 (or Vercel の Network offline)
# → ページアクセス時にエラーメッセージが表示される
# 期待結果:
# - 通信エラー: "通信エラーが発生しました"
# - Clear error messages with no stack traces exposed

# Step 2: Supabase を再開
# → ページ再読み込み or 更新ボタン → 正常復帰
# 期待結果: データが再度読み込まれる
```

## ✅ Phase 5: 監視 + ロギング

### 5.1 Vercel Analytics

```bash
# Step 1: Vercel Dashboard → Analytics
# 確認項目:
#   - Page Load Time
#   - First Contentful Paint (FCP)
#   - Cumulative Layout Shift (CLS)

# 期待結果:
#   - FCP: < 2 sec
#   - LCP: < 3 sec
#   - CLS: < 0.1
```

### 5.2 Supabase Realtime ログ

```bash
# Supabase Dashboard → Realtime
# 接続数、メッセージ数を確認

# 期待結果:
#   - Active connections: 利用中の端末数に応じて 1~10+
#   - No errors in logs
```

### 5.3 API エラーログ

```bash
# Vercel Dashboard → Functions (or Logs)
# API route の呼び出し結果を確認

# 期待結果:
#   - GET /api/care-receivers/list: 200 responses
#   - POST /api/care-receivers/list: 201 (create) or 400 (validation)
#   - DELETE requests: 200 (success) or 404 (RLS blocked)
```

## ✅ Phase 6: 本番運用ハンドブック

### 6.1 ユーザー追加手順

```bash
# Supabase Dashboard → Authentication → Add user
# Step 1: Email: new-staff@example.com
# Step 2: Auto-generate password or set manual password
# Step 3: Supabase Dashboard → Staff Profiles テーブル → Insert
# {
#   id: [auth user id],
#   facility_id: [facility id],  # "life-care" or "after-school"
#   role: "staff",                # "admin" | "staff" | "viewer"
#   created_at: now()
# }

# Step 4: ユーザーにメール通知（手動）
```

### 6.2 バックアップ手順

```bash
# Supabase Dashboard → Database → Backups
# Weekly automatic backups are enabled by default

# 手動バックアップ:
# 1. Supabase Dashboard → Database → Backups → "Backup Now"
# 2. ダウンロード可能状態になるまで待機（2~5 分）
# 3. CSV export: care_receivers, case_records テーブルのエクスポート
```

### 6.3 モニタリング+ アラート設定

```bash
# Supabase Dashboard → SQL Editor
# 以下の監視クエリを定期実行 (daily):

-- 1. ユーザー登録数
SELECT COUNT(*) as total_users FROM care_receivers WHERE is_active = TRUE;

-- 2. 本日のケア記録数
SELECT COUNT(*) as records_today 
FROM case_records 
WHERE DATE(created_at) = CURRENT_DATE;

-- 3. API エラー件数
SELECT COUNT(*) FROM logs 
WHERE level = 'error' AND created_at > NOW() - INTERVAL '1 hour';
```

## トラブルシューティング

### Q: ログイン後、"/login ページが表示され続ける"

**A:** 
- Supabase セッション有効期限を確認: Dashboard → Authentication → Policies
- Middleware が実行されているか確認: DevTools → Network → middleware.js/js
- .env.local の NEXT_PUBLIC_SUPABASE_URL が正しいか確認

### Q: "RLS policy violation" エラーが出る

**A:**
- User の staff_profiles が存在するか確認:
  ```sql
  SELECT * FROM staff_profiles WHERE id = 'user-id';
  ```
- facility_id が正しく設定されているか確認
- RLS ポリシーを確認: Dashboard → SQL Editor → Policies

### Q: Realtime 更新が反映されない

**A:**
- Supabase Realtime が有効か確認: Dashboard → Realtime
- ブラウザコンソール: `[useRealtimeCareReceivers] Subscription error` を確認
- Supabase ステータスページを確認: https://status.supabase.com

### Q: "接続エラーが発生しました" メッセージが出る

**A:**
- Network タブで API 呼び出しの status code を確認
  - 401: 認証失敗 → ログインし直す
  - 403: 権限なし → RLS ポリシーを確認
  - 500: サーバーエラー → Supabase ログを確認
- Supabase Status: https://status.supabase.com で障害を確認

## チェックリスト最終確認

- [ ] Phase 1.1~1.7: ローカル検証完了
- [ ] Phase 2.1~2.4: ビルド + 型チェック + Lint + テスト成功
- [ ] Phase 3.1~3.3: Vercel デプロイ + ドメイン設定完了
- [ ] Phase 4.1~4.4: 本番環境での全テスト成功
- [ ] Phase 5.1~5.3: 監視 + ロギング確認
- [ ] Phase 6.1~6.3: 運用ハンドブック準備完了

**全チェックマーク完了時点で本番運用可能**

---

最終更新: 2025-02-17  
担当: GitHub Copilot + ChatGPT  
次確認日: 毎週月曜 09:00 JST
