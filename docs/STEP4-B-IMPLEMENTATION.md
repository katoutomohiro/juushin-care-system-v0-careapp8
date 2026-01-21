# STEP4-B 実装完了ドキュメント

完了日: 2026年1月15日

## 実装内容（全5ステップ）

### ✅ STEP4-B-1：DBスキーマ整合（service_id 500エラー解決）
**ファイル**: `app/api/care-receivers/list/route.ts`

**変更内容**:
- service_id (uuid FK) ではなく service_code (text) で filter
- 不要な services テーブル join を削除
- display_name, age, gender, care_level, condition, medical_care を response に含める
- エラーハンドリング: ok: false を 200 で返す

**動作**: `GET /api/care-receivers/list?serviceCode=life-care` で 200 OK、users 配列を返す

---

### ✅ STEP4-B-2：利用者管理画面（2カテゴリ表示）
**ファイル**: `app/services/[serviceId]/users/page.tsx`

**変更内容**:
- 単一サービステーブル UI → 2セクション（生活介護/放デイ）カード型 UI に変更
- 両サービスを並列 fetch（Promise.all）
- 各セクション: loading/error/empty/users グリッド表示
- カード click で詳細ページへ遷移（`/services/[serviceCode]/users/[id]`）

**表示フィールド**: code, name, age, gender, care_level, condition

---

### ✅ STEP4-B-3：CRUD API実装
**ファイル**: 
- `app/api/care-receivers/[id]/route.ts` (GET/PUT/DELETE)
- `app/api/care-receivers/list/route.ts` (POST追加)

**API エンドポイント**:
- `GET /api/care-receivers/[id]` - 単一取得
- `PUT /api/care-receivers/[id]` - 更新（display_name を name にマップ）
- `DELETE /api/care-receivers/[id]` - 削除
- `POST /api/care-receivers/list` - 作成（code 重複チェック付き）

**全APIの返却形式**: `{ ok: true/false, user?: {...}, error?: "..." }`

---

### ✅ STEP4-B-4：データ反映保証（server actions + revalidatePath）
**ファイル**:
- `lib/actions/care-receivers.ts` (server actions)
- `components/edit-care-receiver-modal.tsx` (編集UI)

**server actions**:
- `revalidateCareReceiversData()` - 全関連ページを再検証
- `createCareReceiverAction()` - POST + revalidate
- `updateCareReceiverAction()` - PUT + revalidate
- `deleteCareReceiverAction()` - DELETE + revalidate

**再検証範囲**: `/services/[serviceId]/users`, `/dashboard`, tag: `care-receivers-*`

**編集 UI**:
- モーダル型フォーム（全フィールド）
- 保存 → server action + router.refresh()
- 削除 → 確認 → server action + 一覧へ戻す
- エラー表示（toast/alert）

---

### ✅ STEP4-B-5：開発手順標準化（既実装）
**対応**:
- README に "推奨スタートアップ" セクション追加
- `pnpm run reboot` コマンド確立（port free → cache 削除 → 起動）
- `pnpm run check-server` で起動確認
- トラブル対応セクション整備
- PowerShell プロファイル設定ガイド提供

---

## テスト手順

```powershell
# 1. キャッシュ削除・起動
pnpm run reboot

# 2. サーバー確認
pnpm run check-server

# 3. ブラウザで確認
# - http://localhost:3000
# - サービスへ移動 → "利用者管理" ボタン
# - 2セクション（生活介護/放デイ）が表示されている
# - 利用者カード click → 詳細ページ
# - "編集" ボタン → モーダルで氏名・年齢など更新可能

# 4. TypeScript/Lint チェック
pnpm typecheck
pnpm lint
```

---

## 追加実装が必要な場合

### 「新規利用者追加」画面
`app/services/[serviceId]/users/page.tsx` に "新規追加" ボタンを追加し、
POST /api/care-receivers/list を呼び出すフォームを実装してください。
server action: `createCareReceiverAction()` を使用してください。

### ケース記録との連携
利用者削除時にケース記録も削除するか、orphaned record を処理する仕様を決定してください。
現在は cascade delete なし。

### RLS（Row Level Security）
開発環境では RLS ポリシーが開放的です。本番デプロイ前に Supabase RLS を設定してください。

---

## 関連 commit log

```
7ffa2d7 feat(STEP4-B-4): server actions + automatic data revalidation
359ba60 feat(STEP4-B-3): complete CRUD API (GET/PUT/DELETE/POST)
6c4266d feat(STEP4-B-2): dual-category user management page
afd5275 fix(STEP4-B-1): resolve service_id 500 error
```

---

## 質問・確認事項

- [ ] 利用者の「新規追加」フォーム UI は別タスクか?
- [ ] ケース記録との利用者 FK 制約は設定済みか？
- [ ] Supabase RLS ポリシーの本番化スケジュールは？

