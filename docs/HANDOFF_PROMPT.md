# HANDOFF_PROMPT - AI 引き継ぎ時の確認チェック

**Version**: 1.0  
**Last Updated**: 2026-02-20  
**Status**: 確定版（フェーズ1ドキュメント）  

---

## 📌 概要

本ドキュメントは、**新しい AI エージェントへの引き継ぎ時に必ず確認すべき事項**をまとめています。

### 絶対ルール

1. **会話ログは正本にしない**: GitHub 上の `.md` ファイルのみを正本とする
2. **GitHub-first**: 不文なドキュメント化は作業禁止。ドキュメント → コード の順
3. **セキュリティドキュメント優先**: 実装前に SECURITY_MODEL.md を必ず読む
4. **PLAN_HISTORY 更新必須**: 完了後は必ず git commit で記録

---

## 📖 引き継ぎ時の読む順番

### 📍 最初（必須・全員必読）

```
1. docs/PLAN_MASTER.md
   ├─ 理由: 全体設計の統一ルール確認
   ├─ 所要時間: 10-15 分
   └─ 検収: このファイルに「実装不可 case」「セキュアでない API」は列挙されているか確認

2. docs/ai-collaboration-handbook.md
   ├─ 理由: AI 協調開発の役割・プロセス確認
   ├─ 所要時間: 5-10 分
   └─ 検収: 「個人情報非表示」「UI チェックリスト」を支読
```

### 📍 セキュリティ（実装前）

```
3. docs/SECURITY_MODEL.md ⭐ 最重要
   ├─ 理由: 認証・認可・service_id スコープの統一ルール
   ├─ 所要時間: 15-20 分
   └─ アクション: 確認タスク行のセクションで不明点を質問

4. docs/AUDIT_LOGGING.md
   ├─ 理由: 監査ログ記録パターンの詳細
   ├─ 所要時間: 10 分
   └─ アクション: lib/audit-logging.ts 実装の前チェック

5. docs/DATA_RETENTION.md
   ├─ 理由: PII 削除・バックアップポリシー
   ├─ 所要時間: 10 分
   └─ アクション: cron/自動削除スクリプト計画時に参照
```

### 📍 技術（機能開発時）

```
6. TECHNICAL_ARCHITECTURE.md
   ├─ 理由: スタック・ファイル構成・データフロー
   ├─ 所要時間: 20 分
   └─ 使用場面: 新規ファイル作成時の参照

7. docs/PLAN_CASE_RECORD.md（ケース記録開発の場合）
   ├─ 理由: ケース記録スキーマ・A4 レイアウト詳細
   ├─ 所要時間: 15 分
   └─ 使用場面: case_records API 修正時

8. docs/FEATURES.md
   ├─ 理由: 実装済み機能一覧・未実装タスク
   ├─ 所要時間: 5 分
   └─ アクション: タスク前に最新版に更新するか確認
```

### 📍 トラブル対応（問題発生時）

```
9. docs/PLAN_HISTORY.md
   ├─ 理由: 過去の問題・採った対策を確認
   ├─ 所要時間: 10-20 分（該当セクションのみ）
   └─ 用途: 「400 エラー」「RLS ポリシーエラー」などは履歴検索

10. docs/ROUTING_ANALYSIS.md
   ├─ 理由: ケース記録フロント側のルーティング調査結果
   ├─ 所要時間: 5 分（必要な場合のみ）
   └─ 用途: `/daily-log` vs `/case-records` の使い分け確認
```

---

## ✅ 引き継ぎチェックリスト

### 0️⃣ ドキュメント確認（全員）

- [ ] PLAN_MASTER.md を読んだか
- [ ] ai-collaboration-handbook.md を読んだか
- [ ] 「推測禁止」「セキュアでない API」がわかっているか

### 1️⃣ セキュリティ確認（コード開発時）

- [ ] SECURITY_MODEL.md の「API 強制順序」（認証 → 認可 → 処理 → 監査）を読んだか
- [ ] service_id スコープの重要性を理解したか
- [ ] SUPABASE_SERVICE_ROLE_KEY 使用時も認可省略禁止ルールを確認したか
- [ ] 実装する API に service_id 引数があるか確認したか
- [ ] AUDIT_LOGGING.md の「PII 禁止」ルールを確認したか
  - [ ] full_name, address, phone, medical_care_detail をログに含めていないか

### 2️⃣ コード品質確認（実装完了時）

- [ ] `pnpm typecheck` を実行したか
- [ ] `pnpm lint` を実行したか
- [ ] 新規 API は POST テスト（curl/Postman）で動作確認したか
- [ ] 新規 API は RLS で保護されているか確認したか（dev profile で読み取れないことを確認）
- [ ] 監査ログを呼び出しているか（logAccess, logCreateXxx など）

### 3️⃣ コミット・PR 確認（push 前）

- [ ] git status で不要なファイルをコミットしていないか
  - [ ] `.env.local` はコミットされていないか
  - [ ] `node_modules/` はコミットされていないか
  - [ ] `pnpm-lock.yaml` は必要に応じて更新されているか
- [ ] コミットメッセージが「何をしたか」を説明しているか
- [ ] docs/PLAN_HISTORY.md に実装内容を記録したか ⭐ 必須
- [ ] タスクが複数の場合、PR 説明欄に「What」「Why」「How」を明記したか

---

## 🔍 会話ログ / 文脈の取り扱い

### ❌ 禁止事項

```
❌ 会話ログを docs に貼り付ける
❌ "前回 AI が言った" を根拠にする
❌ コミットメッセージに会話内容を含める
❌ 中途半端な推測でドキュメント化
```

### ✅ 正解パターン

```
✅ GitHub の docs を読む
✅ 不明点は「docs に 確認タスク として明記」する
✅ 実装完了後は docs/PLAN_HISTORY.md に記録
✅ PR Description で「前条件・判断理由・改修内容」を説明
```

---

## 📝 実装完了後の作業（必須）

### 1. docs/PLAN_HISTORY.md を更新

```markdown
## 日付 YYYY-MM-DD: 実装内容の簡潔なタイトル

### 背景
- 対応した issue/task 番号
- 解決した問題の説明

### 実装内容
- 変更ファイル一覧
- 主な変更内容
  - API エンドポイント追加
  - DB マイグレーション
  - UI コンポーネント更新

### 検証方法
- 手動テスト手順
- 自動テスト実行

### 参考資料
- 関連 PR リンク
- 関連 docs 相互参照

### 残留課題（あれば）
- 将来実装予定の事項
- セキュリティ向上案
```

### 2. PR Description を記入

```markdown
## What（何を変更したか）
- [ ] fix: service_id 必須化（care_receivers API）
- [ ] feat: 監査ログ記録機能
- [ ] docs: SECURITY_MODEL.md 追加

## Why（なぜ）
- CodeQL セキュリティスキャンの SSRF 警告対応
- SECURITY_MODEL.md で定義した認可チェック実装

## How（実装内容）
- app/api/care-receivers/route.ts
  - GET: service_id で filter
  - POST: リクエスト service_id を検証
  - 監査ログ呼び出し追加

## Testing
- pnpm test (unit test)
- curl -H "Authorization: ..." http://localhost:3000/api/care-receivers?service_id=...

## Checklist
- [x] typecheck 通過
- [x] lint 通過
- [x] 新規 API に RLS ポリシー確認
- [x] 監査ログ呼び出し実装
- [x] PLAN_HISTORY.md 更新
```

### 3. git add & commit

```bash
# ファイルをステージ
git add docs/PLAN_HISTORY.md docs/SECURITY_MODEL.md app/api/...

# コミット（何をしたか 1 行 + 詳細）
git commit -m "docs: establish SECURITY_MODEL, audit logging, and retention policy

- Add SECURITY_MODEL.md (認証→認可→処理→監査の API 強制順序)
- Add AUDIT_LOGGING.md (PII 禁止ルール + 実装パターン)
- Add DATA_RETENTION.md (保存期間ポリシー + 自動削除script)
- Add HANDOFF_PROMPT.md (引き継ぎチェックリスト)
- Update .ai/READ_BEFORE_RUN.md (SECURITY_MODEL 参照追加)
- Update docs/PLAN_MASTER.md (セキュリティ方針要約)
- Update docs/PLAN_HISTORY.md (今月タスク記録)

Refs: CodeQL SSRF fix, security governance"

git push origin feature/branch-name
```

---

## 🤔 よくある質問

### Q1: PLAN_MASTER.md に「推測禁止」と書いてあるが、不明点が多い

**A**: 次のステップで対応：

```
1. docs で関連セクションを探す（SECURITY_MODEL, DOMAIN_MODEL など）
2. 自分の推測を PLAN_HISTORY.md に「確認タスク」として明記
3. PR で「確認待ち」とマークして push
4. オーナーからのレビュー待機
5. OKもらえたら実装 or docs 修正
```

### Q2: 前の AI が実装した機能が古いドキュメントと矛盾している

**A**: GitHub の**実装コード が正本**。ドキュメントを修正：

```
1. 実装コードを読む
2. ドキュメント修正案を PR に含める
3. コミットメッセージで「docs: align with implementation」と明記
```

### Q3: セキュリティチェックで引っかかった（CodeQL など）

**A**: SECURITY_MODEL.md の該当セクションで解決パターンを確認：

```
1. エラーメッセージから危険パターンを特定
   - SSRF? → req.nextUrl.origin 削除
   - SQL injection? → parameterized query 使用
   - XXS? → React デフォルト（自動 escape）
2. SECURITY_MODEL で該当セクションを読む
3. テンプレート実装パターンをコピペ
```

### Q4: 個人情報（full_name など）がログに出ていた

**A**: AUDIT_LOGGING.md の「禁止項目」を確認し、即座に削除：

```typescript
// ❌ 間違い
console.log('User:', user.full_name, user.address);

// ✅ 正しい
console.log('User ID hash:', hashField(user.id));
```

---

## 📞 サポート窓口（不明時）

| 区分 | 確認先 | 例 |
|------|--------|-----|
| **全般設計** | docs/PLAN_MASTER.md | 「権限の定義」「service_id とは」 |
| **セキュリティ** | docs/SECURITY_MODEL.md | 「API チェックリスト」「RLS とは」 |
| **監査ログ** | docs/AUDIT_LOGGING.md | 「何をログに含める」「実装パターン」 |
| **PII 保護** | PLAN_PERSONAL_INFO_SECURITY.md | 「どのフィールドが個人情報か」 |
| **過去トラブル** | docs/PLAN_HISTORY.md | 「あのバグの原因」「採った対策」 |
| **ルーティング** | docs/ROUTING_ANALYSIS.md | 「/daily-log と /case-records の違い」 |

---

## 🚀 実装開始フロー（テンプレート）

```
1. ユーザー要求受け取り
   ↓
2. docs/PLAN_MASTER.md を読む（5分）
   ├─ 推測禁止 ← このプロジェクトの鉄則
   ├─ セキレビ必須
   └─ 個人情報非表示
   ↓
3. 実装対象 API に応じた docs を読む
   ├─ API セキュリティ? → SECURITY_MODEL.md
   ├─ service_id 必須? → SECURITY_MODEL.md「認可フロー」
   ├─ ログ記録? → AUDIT_LOGGING.md
   └─ 削除機能? → DATA_RETENTION.md
   ↓
4. 不明点あれば PLAN_HISTORY.md に「確認タスク」として記録
   ↓
5. コード実装
   └─ git commit で修正内容を説明
   ↓
6. PR を出す
   ├─ What/Why/How 記入
   ├─ Checklist 確認
   └─ docs/PLAN_HISTORY.md 更新必須
   ↓
7. Complete ✅
```

---

## 参照

- [PLAN_MASTER.md](./PLAN_MASTER.md) - プロジェクト全体方針
- [SECURITY_MODEL.md](./SECURITY_MODEL.md) - セキュリティ設計（実装前に必読）
- [ai-collaboration-handbook.md](./ai-collaboration-handbook.md) - AI 協調開発ガイド
