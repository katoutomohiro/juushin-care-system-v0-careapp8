# PR マージ判定チェックリスト

> **マージの条件**: GitHub の Checks がすべて green になること

## 1️⃣ ローカル確認（必須）

PR をマージする前に、ローカルで必ず以下を実行してください。

```powershell
# ステップ 1: 最新 commit をローカルで確認
git log --oneline -1

# ステップ 2: 型チェック
pnpm typecheck
# 期待: exit code 0（エラーなし）

# ステップ 3: Lint
pnpm lint
# 期待: exit code 0（エラーなし）

# ステップ 4: Build
pnpm build
# 期待: exit code 0、すべてのページ生成成功
```

**どれか 1 つでも失敗した場合**:
- ❌ マージしない
- PR に問題のあるコミットを指摘してリクエスト修正

## 2️⃣ GitHub Checks 確認（必須）

PR ページの **Checks** タブを確認：

```
✅ Vercel        → SUCCESS
✅ SonarCloud    → SUCCESS（Quality Gate PASS）
✅ CodeQL        → SUCCESS
✅ Lint & Type   → SUCCESS
✅ Build Test    → SUCCESS
```

**落ちやすいもの**:
1. **Vercel**: デプロイが失敗する場合は、本番環境の env vars を確認
2. **SonarCloud**: New Code の質が基準を下回る場合は、該当ファイルの issues を修正

## 3️⃣ マージ実行

すべての Checks が green なら、以下を実行：

```powershell
# ローカルで確認済みなら GitHub UI でマージ
# または CLI で:
gh pr merge <PR番号> --squash

# または
git merge <branch> && git push origin main
```

## 4️⃣ Post-merge 確認（推奨）

マージ後、以下を確認：

```powershell
# ローカル main ブランチを更新
git checkout main
git pull origin main

# 本番環境（Vercel）のデプロイ完了を確認
# https://vercel.com → Deployments → Status が SUCCESS
```

---

## よくある失敗パターンと対応

| 失敗 | 原因 | 対応 |
| --- | --- | --- |
| Lint エラー | ESLint が引っかかった | `pnpm lint` の output を確認して修正 |
| Build エラー | Next.js がコンパイル失敗 | `pnpm build` の log を読んで型やパス修正 |
| SonarCloud 落ちる | Quality Gate 基準不達成 | SonarCloud の Issues tab で New Code を確認、修正 |
| Vercel 失敗 | 本番環境の env vars 不足 | Vercel Project Settings → Environment Variables を確認 |

---

**最終更新**: 2026-01-29
