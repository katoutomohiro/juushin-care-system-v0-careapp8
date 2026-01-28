# 重心ケアアプリ｜マスタープラン（絶対ルール）

> **📌 すべてのAIエージェント・開発者への必須指示**  
> - 本ファイルは設計ドキュメントの **エントリーポイント** です  
> - 作業開始前に必ず本ファイルを読み、参照順序に従ってください  
> - **推測禁止**: 不明点は "不明" と明記し、オーナーに質問すること  
> - シークレット（API キー等）はコミット禁止。Vercel 環境変数で管理

---

## 📖 ドキュメント参照順序（必須）

### 1️⃣ 最初に読むドキュメント
```
docs/PLAN_MASTER.md ← 今ここ（絶対ルール）
  ↓
docs/ai-collaboration-handbook.md（AI協調開発の役割分担・開発サイクル）
  ↓
TECHNICAL_ARCHITECTURE.md（技術スタック・データモデル）
```

### 2️⃣ 機能開発時に読むドキュメント
```
docs/PLAN_CASE_RECORD.md（ケース記録仕様：ATさん完成形を参照）
  ↓
docs/FEATURES.md（全機能一覧・ルート棚卸し結果）
  ↓
docs/CONCURRENCY.md（同時編集制御：楽観ロック設計）
```

### 3️⃣ デプロイ・運用時に読むドキュメント
```
docs/PLAN_DEPLOY.md（Vercel + Supabase 本番運用手順）
  ↓
docs/DEPLOYMENT.md（詳細デプロイ手順・環境変数）
```

### 4️⃣ 経緯確認・トラブルシューティング
```
docs/PLAN_HISTORY.md（開発経緯ログ：404問題→ルーティング整理など）
  ↓
docs/ROUTING_ANALYSIS.md（ケース記録ルーティング調査）
```

---

## 🎯 プロジェクト概要

| 項目 | 内容 |
|------|------|
| **アプリ名** | 重心ケア支援アプリ（暫定名） |
| **目的** | 医療・介護現場での重症心身障がい児者ケア記録の効率化 |
| **技術スタック** | Next.js 15.2.4 (App Router)、React 19、TypeScript 5 |
| **スタイリング** | Tailwind CSS 3.4、shadcn/ui (Radix UI) |
| **データ層** | Supabase (PostgreSQL + Auth + RLS) |
| **デプロイ** | Vercel (Next.js) + Supabase (本番環境) |
| **テスト** | Vitest、Playwright、Testing Library |
| **リポジトリ** | `katoutomohiro/juushin-care-system-v0-careapp8` |

---

## 🚨 絶対ルール（違反禁止）

### 1. **推測禁止**
- 仕様が不明な場合は「不明」と明記し、作業を止めて質問すること
- 例: "ATさんのテンプレートフィールドは？" → 不明なら "不明" と書く

### 2. **シークレット管理**
- API キー、データベース認証情報は **絶対にコミットしない**
- Vercel 環境変数 (`NEXT_PUBLIC_SUPABASE_URL` など) で管理
- `.env.local` はローカル開発のみ使用、`.gitignore` 必須

### 3. **ドキュメント参照順序の厳守**
- 必ず `docs/PLAN_MASTER.md`（本ファイル）から読み始める
- 機能開発前に `docs/PLAN_CASE_RECORD.md` でケース記録の完成形を確認
- デプロイ前に `docs/PLAN_DEPLOY.md` の手順を確認

### 4. **ATさん = 完成形リファレンス**
- ケース記録の実装で迷ったら、「ATさんのページ」を参照実装とする
- URL: `/services/life-care/users/AT/case-records`
- テンプレート、職員選択、バリデーションなどすべてATさんで動作確認済み

### 5. **楽観ロック必須**
- ケース記録の保存時は必ず `version` パラメータを送信
- 409 Conflict 時は「他の端末で更新されています」ダイアログ表示
- 詳細: `docs/CONCURRENCY.md` 参照

### 6. **個人情報の取り扱い（厳格）**
- **ログ出力禁止**: `full_name`, `address`, `phone`, `emergency_contact` などは `console.log` に絶対に出力しない
- **開発環境では匿名データのみ**: 開発・レビュー時は `display_name`（例: AT, User-001）のみ使用
- **本番のみ実名入力**: 個人情報は本番環境でのみ入力し、開発環境には含めない
- **サンプルデータ禁止**: migration や seed ファイルに実名・住所・電話番号を含めない
- **RLS で保護**: Supabase RLS で職員のみアクセス可能にする（anon からは個人情報を取得不可）
- **監査ログの最小化**: audit テーブルには変更されたフィールド名のみ記録し、値は含めない

---

## � 個人情報管理レイヤ（必読）

### 概要
医療機関として求められるセキュリティと利便性のバランスを実現するため、多層防御を実装しています。

### 関連ドキュメント
- **詳細設計書**: [PLAN_PERSONAL_INFO_SECURITY.md](./PLAN_PERSONAL_INFO_SECURITY.md)
- **RLS ポリシー**: `supabase/migrations/20260128110000_extend_rls_role_separation.sql`
- **UI 権限制御**: `components/edit-care-receiver-dialog.tsx`

### 権限別表示制御

```
display_name（匿名表示）
├ 全ユーザー表示
├ ログ出力: ✅ OK
└ 編集権限: staff/nurse/admin

full_name, birthday, gender（個人識別情報）
├ staff/nurse/admin のみ表示
├ nurse/admin が編集可
└ ログ出力: ❌ 禁止

address, phone, emergency_contact（連絡先情報）
├ admin のみ表示
├ admin のみ編集
└ ログ出力: ❌ 禁止

medical_care_detail（医療情報）
├ nurse/admin のみ表示
├ nurse/admin が編集可
└ ログ出力: ❌ 禁止
```

### 実装状況

| 項目 | ファイル | 状態 |
|------|---------|------|
| セキュリティ設計書 | `docs/PLAN_PERSONAL_INFO_SECURITY.md` | ✅ 完成 |
| DB Migration 1 | `supabase/migrations/20260128100000_add_personal_info_to_care_receivers.sql` | ✅ 完成 |
| DB Migration 2 | `supabase/migrations/20260128110000_extend_rls_role_separation.sql` | ✅ 完成 |
| UI コンポーネント | `components/edit-care-receiver-dialog.tsx` | ✅ 権限ベース表示実装 |
| テスト手順 | `docs/TEST_CARE_RECEIVER_EDIT.md` | ✅ 7シナリオ記載 |

---

## �📂 ディレクトリ構造（重要ファイル）

```
juushin-care-system-v0-careapp8/
├── docs/
│   ├── PLAN_MASTER.md ← 本ファイル（エントリーポイント）
│   ├── PLAN_PERSONAL_INFO_SECURITY.md ← 個人情報セキュリティ設計
│   ├── PLAN_DEPLOY.md ← Vercel 本番デプロイ手順
│   ├── PLAN_CASE_RECORD.md ← ケース記録仕様
│   ├── PLAN_HISTORY.md ← 開発経緯ログ
│   ├── FEATURES.md ← 全機能一覧（32ルート）
│   ├── CONCURRENCY.md ← 楽観ロック設計
│   ├── DEPLOYMENT.md ← デプロイ詳細手順
│   ├── TEST_CARE_RECEIVER_EDIT.md ← 利用者情報編集テスト手順
│   └── ai-collaboration-handbook.md ← AI協調開発ルール
├── app/
│   ├── api/care-receivers/[id]/route.ts ← 個人情報 API（権限チェック）
│   ├── api/case-records/save/route.ts ← ケース記録保存API（409 Conflict 対応）
│   └── services/[serviceId]/users/[userId]/case-records/page.tsx
├── components/
│   ├── edit-care-receiver-dialog.tsx ← 権限ベース個人情報編集フォーム
│   └── case-records/CaseRecordFormClient.tsx
├── supabase/migrations/
│   ├── 20260128100000_add_personal_info_to_care_receivers.sql
│   ├── 20260128110000_extend_rls_role_separation.sql
│   └── 20260128093212_add_version_to_case_records.sql
├── .env.local ← ローカル環境変数（.gitignore 必須）
└── .github/copilot-instructions.md ← AI Copilot への指示
```

---

## 🔐 環境変数（Vercel 設定必須）

### Production / Preview / Development 全環境に設定

| 環境変数 | 説明 | 例 |
|---------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー（公開OK） | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー（サーバーのみ） | `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | アプリの本番 URL（推奨） | `https://juushin-care.vercel.app` |

**設定手順**: `docs/PLAN_DEPLOY.md` 参照

---

## 🎓 開発フロー（AI協調）

### 作業開始時の必須チェック
1. ✅ `docs/PLAN_MASTER.md`（本ファイル）を読んだ
2. ✅ `docs/ai-collaboration-handbook.md` で役割分担を確認した
3. ✅ `docs/PLAN_PERSONAL_INFO_SECURITY.md` で個人情報管理を確認した
4. ✅ 不明点は "不明" と書いて質問する準備ができた
5. ✅ シークレットをコミットしないことを確認した

### タスク実行順序
```
1. オーナーから指示受領
   ↓
2. docs/PLAN_MASTER.md で参照順序確認
   ↓
3. 該当するPLAN_*.md を読む（CASE_RECORD / DEPLOY / HISTORY）
   ↓
4. 実装（ChatGPT 主導、Copilot/v0 補助）
   ↓
5. オーナー検証
   ↓
6. コミット＋PR作成
```

---

## 📊 現在の開発状況（2026年1月28日時点）

### ✅ 完了済み
- [x] 機能棚卸し（32ルート、11 API エンドポイント）
- [x] ケース記録ルーティング整理（動的 userId 対応）
- [x] 楽観ロック実装（version カラム + 409 Conflict）
- [x] Vercel デプロイ設計ドキュメント作成

### 🚧 進行中
- [ ] PLAN_*.md シリーズの整備（本タスク）
- [ ] Vercel 本番デプロイ実行
- [ ] RLS ポリシー再確認

### 📋 優先タスク（次のステップ）
1. **Vercel 本番デプロイ**: `docs/PLAN_DEPLOY.md` 手順に従って実行
2. **ATさんデータ投入**: Supabase に ATさんのシードデータ登録
3. **動作確認**: トップ表示 → ログイン → ATさんページ → ケース記録導線

---

## 🆘 困ったときの参照先

| 質問内容 | 参照ドキュメント |
|---------|----------------|
| ケース記録の仕様は？ | `docs/PLAN_CASE_RECORD.md` |
| Vercel デプロイ手順は？ | `docs/PLAN_DEPLOY.md` |
| 過去の経緯を知りたい | `docs/PLAN_HISTORY.md` |
| 全機能一覧は？ | `docs/FEATURES.md` |
| 同時編集制御の仕組みは？ | `docs/CONCURRENCY.md` |
| AI の役割分担は？ | `docs/ai-collaboration-handbook.md` |

---

**最終更新**: 2026年1月28日  
**メンテナ**: ChatGPT (gpt-5-codex) + オーナー  
**次回更新タイミング**: 本番デプロイ完了後、または仕様変更時
