# 📚 重心ケアシステム - 完全ガイドインデックス

このファイルは、重心ケアシステム (juushin-care-system-v0-careapp8) の全ドキュメントへのアクセスガイドです。

---

## 🔴 **緊急対応: /?careReceiverId=AT リダイレクト不具合**

**症状**: ユーザーがログインできない。/ にアクセスするとトランスパレントに /?careReceiverId=AT が付加される。

**ステータス**: ✅ **修正完了**、デプロイ待ち

**対応ドキュメント**:
1. **[FIX_CARERECEVERID_REDIRECT_GUIDE.md](./FIX_CARERECEVERID_REDIRECT_GUIDE.md)** ⭐ **[最初に読むべき]**
   - 問題概要、root cause 分析、コード修正
   - デプロイ手順、トラブルシューティング

2. **[DEPLOYMENT_COMPLETE_CHECKLIST.md](./DEPLOYMENT_COMPLETE_CHECKLIST.md)**
   - Vercel デプロイ前後のチェックリスト
   - 環境変数確認、本番テスト手順
   - トラブルシューティング詳細

**次のアクション**:
```bash
# 1. ローカルで修正を確認
pnpm typecheck && pnpm lint && pnpm build && pnpm dev

# 2. Vercel にデプロイ
git add app/page.tsx app/home-client.tsx
git commit -m "fix: remove auto-redirect to careReceiverId on root page"
git push origin main

# 3. 本番環境を検証
# https://juushin-care-system-v0-careapp8.vercel.app/
# ✅ ?careReceiverId=AT が付かないことを確認
```

---

## 🟡 **フェーズ2: Admin 機能有効化**

**目的**: Admin パスワード認証と Admin Settings パネルを本番環境で使用可能にする。

**現在の状態**:
- ✅ Admin コンポーネント存在（admin-password-auth.tsx、admin-settings.tsx）
- ❌ 無効化状態（managementDisabled = true）
- ❌ lib/features.ts 未実装
- ❌ Vercel 環境変数未設定

**対応ドキュメント**:
- **[ADMIN_FEATURE_ENABLEMENT_PLAN.md](./ADMIN_FEATURE_ENABLEMENT_PLAN.md)** ⭐ **[Step-by-step ガイド]**
  - Step 1: lib/features.ts 作成
  - Step 2: admin-password-auth.tsx 修正
  - Step 3: Vercel 環境変数設定
  - Step 4-6: テスト、デプロイ、本番検証

**タイムライン**: careReceiverId 修正デプロイ後、別途実施

---

## 📖 ドキュメント一覧

### 緊急対応関連

| ファイル | 用途 | 優先度 |
|---------|------|--------|
| [FIX_CARERECEVERID_REDIRECT_GUIDE.md](./FIX_CARERECEVERID_REDIRECT_GUIDE.md) | 全アクション: / リダイレクト問題の fix & deploy | 🔴 **今すぐ** |
| [DEPLOYMENT_COMPLETE_CHECKLIST.md](./DEPLOYMENT_COMPLETE_CHECKLIST.md) | Deploy 手順・事前確認・トラブルシューティング | 🔴 **今すぐ** |

### 機能実装関連

| ファイル | 用途 | 優先度 |
|---------|------|--------|
| [ADMIN_FEATURE_ENABLEMENT_PLAN.md](./ADMIN_FEATURE_ENABLEMENT_PLAN.md) | Admin 機能有効化の step-by-step | 🟡 次フェーズ |

### プロジェクト管理関連

| ファイル | 用途 |
|---------|------|
| [../ai-collaboration-handbook.md](./ai-collaboration-handbook.md) | AI 協調開発の方針・ロール・チェックリスト |
| [../QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | よく使うコマンド・トラブルシューティング |

### 技術 Reference

| ファイル | 用途 |
|---------|------|
| [../.github/copilot-instructions.md](../.github/copilot-instructions.md) | コード品質基準・エラーハンドリング |
| [../TECHNICAL_ARCHITECTURE.md](../TECHNICAL_ARCHITECTURE.md) | 全体アーキテクチャ・データモデル |

---

## 🚀 推奨される読み順

### **今すぐ対応が必要な場合（ログイン画面が見えない）**

1. **[FIX_CARERECEVERID_REDIRECT_GUIDE.md](./FIX_CARERECEVERID_REDIRECT_GUIDE.md)** を読む
   - 問題理解：3分
   - Root cause：2分
   - コード修正：5分

2. **ローカルで修正確認**
   ```bash
   # app/page.tsx と app/home-client.tsx の修正を確認
   pnpm build && pnpm dev
   # / にアクセス → ?careReceiverId=AT が付かないことを確認
   ```

3. **[DEPLOYMENT_COMPLETE_CHECKLIST.md](./DEPLOYMENT_COMPLETE_CHECKLIST.md)** を用いてデプロイ
   - ✅ チェック欄をマーク
   - `git push origin main`
   - Vercel auto-deploy 確認

4. **本番環境テスト**
   - https://juushin-care-system-v0-careapp8.vercel.app/ を確認
   - ?careReceiverId=AT が付いていないことを検証

---

### **Admin 機能を有効化したい場合（ログイン後）**

1. **[ADMIN_FEATURE_ENABLEMENT_PLAN.md](./ADMIN_FEATURE_ENABLEMENT_PLAN.md)** を読む
   - Step 1～6 を順番に実行

2. **ローカルテスト**
   - `ENABLE_ADMIN_FEATURES=true` を .env.local に追加
   - Admin パスワード入力・Settings パネルが動作するか確認

3. **本番デプロイ**
   - Vercel Dashboard で ENABLE_ADMIN_FEATURES=true に設定
   - Git push で自動デプロイ

---

## 💡 よくある質問

### Q: /?careReceiverId=AT はなぜ付く？
**A**: app/home-client.tsx の L104 で router.replace() が自動的に URL を書き換えていた。
→ 修正済み。[FIX_CARERECEVERID_REDIRECT_GUIDE.md](./FIX_CARERECEVERID_REDIRECT_GUIDE.md#root-cause-analysis) 参照。

### Q: ログイン画面が見えない。どうすればいい？
**A**: 
1. https://juushin-care-system-v0-careapp8.vercel.app/ を開く
2. URL バーに `?careReceiverId=` が付いていないか確認
3. 付いていたら、[DEPLOYMENT_COMPLETE_CHECKLIST.md](./DEPLOYMENT_COMPLETE_CHECKLIST.md#-問題-それでも-carereceiveridatが付く) のトラブルシューティングを実行

### Q: Admin 設定はいつ使える？
**A**: careReceiverId 問題を修正・デプロイした後、[ADMIN_FEATURE_ENABLEMENT_PLAN.md](./ADMIN_FEATURE_ENABLEMENT_PLAN.md) を参照して Step 1～6 を実行してください。

### Q: Vercel のビルドが失敗した場合は？
**A**: [DEPLOYMENT_COMPLETE_CHECKLIST.md](./DEPLOYMENT_COMPLETE_CHECKLIST.md#-問題-supabase-接続確認) の「Supabase 接続確認」セクションを確認。

### Q: ローカル環境で動作確認したい。
**A**: 
```bash
pnpm install
pnpm typecheck  # ✅ no errors
pnpm lint       # ✅ no errors
pnpm build      # ✅ success
pnpm dev
# http://localhost:3000 を開く
```

---

## 🔧 主要なコマンド

```bash
# ビルド・チェック（デプロイ前に毎回実行）
pnpm typecheck      # ✅ 型チェック
pnpm lint           # ✅ ESLint
pnpm build          # ✅ Next.js build

# 開発環境
pnpm dev            # http://localhost:3000

# テスト（任意）
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright e2e tests

# Git 操作（デプロイ）
git add [files]
git commit -m "message"
git push origin main  # Vercel が自動デプロイ開始
```

---

## 📞 サポート

### 問題が発生した場合

1. **ドキュメントを確認**
   - [DEPLOYMENT_COMPLETE_CHECKLIST.md](./DEPLOYMENT_COMPLETE_CHECKLIST.md) の「トラブルシューティング」
   - [FIX_CARERECEVERID_REDIRECT_GUIDE.md](./FIX_CARERECEVERID_REDIRECT_GUIDE.md) の「ログインエラー診断」

2. **ローカルで再現テスト**
   ```bash
   pnpm build
   pnpm dev
   # 同じエラーが発生するか確認
   ```

3. **Vercel ログを確認**
   - Vercel Dashboard → Deployments → [最新] → Logs

4. **Supabase ログを確認**
   - Supabase Dashboard → Logs → API requests / Auth / Database

---

## 📝 変更履歴

| 日時 | 変更内容 |
|------|--------|
| 2025-02-15 | 初版: careReceiverId fix guide + Admin enablement plan 作成 |

---

## ✅ ドキュメント管理

すべてのガイドは以下の場所に保存されています：

```
docs/
├── FIX_CARERECEVERID_REDIRECT_GUIDE.md           ← careReceiverId 問題 fix
├── DEPLOYMENT_COMPLETE_CHECKLIST.md              ← Vercel デプロイ手順
├── ADMIN_FEATURE_ENABLEMENT_PLAN.md              ← Admin 機能有効化
├── GUIDES_INDEX.md                               ← このファイル
├── ai-collaboration-handbook.md                  ← AI 協調開発ガイド
├── QUICK_REFERENCE.md                            ← よく使うコマンド
└── ... (その他ドキュメント)
```

**最新情報**: 常にこのファイル (GUIDES_INDEX.md) を確認して、最新のドキュメント構成を把握してください。

---

## 🎯 次のマイルストーン

### ✅ Phase 1: careReceiverId リダイレクト修正
- [x] Root cause 特定
- [x] コード修正 (app/page.tsx, app/home-client.tsx)
- [x] ドキュメント作成
- [ ] Git push & Vercel デプロイ ← **次はここ**
- [ ] 本番環境テスト

### 🟡 Phase 2: Admin 機能有効化
- [ ] lib/features.ts 作成
- [ ] admin-password-auth.tsx 修正
- [ ] Vercel 環境変数設定
- [ ] ローカルテスト
- [ ] デプロイ

### 🟢 Phase 3: Supabase RLS 統合（将来）
- [ ] staff_profiles.admin フラグ活用
- [ ] Server actions で admin 検証
- [ ] API route で RLS 確認
- [ ] Audit log 実装

---

**ドキュメント最終更新**: 2025-02-15
**作成者**: GitHub Copilot + ChatGPT
**プロジェクト**: juushin-care-system-v0-careapp8
