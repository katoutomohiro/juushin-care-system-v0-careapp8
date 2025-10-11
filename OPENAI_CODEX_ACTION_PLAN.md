# OpenAI Codex 実行計画

> **🤖 AI役割分担の確認**: このドキュメントはCodex専用の実行計画です。作業開始前に `FINAL_HANDOVER_TO_CODEX.md` のAI役割分担セクションを必ず確認してください。

## Codexの責任範囲

このアクションプランは、以下のCodexの責任範囲内の作業です：

- ✅ 複雑なロジックの実装と設計
- ✅ アーキテクチャの設計と計画立案
- ✅ コードレビューと品質チェック
- ✅ 複数ファイルにまたがる大規模な変更
- ✅ ドキュメント作成と保守
- ✅ 戦略的な意思決定とトラブルシューティング

**他のAIエージェントとの連携:**
- **v0**: UIコンポーネント生成後、Codexがロジックを統合
- **GitHub Copilot**: Codexが設計した関数をCopilotが実装

---

## 即座に実行すべきタスク

### 🎯 目標
- 8個のPR完全マージ
- リポジトリ100%クリーンアップ
- 重心ケアアプリ開発環境完成

### 📋 実行手順

#### Step 1: 現状確認
\`\`\`bash
# 実際のPR状況確認
gh pr list --state open --json number,title,mergeStateStatus,statusCheckRollup

# 各PRの詳細問題確認
for pr in 209 208 202 183 181 147 146 114; do
  echo "=== PR #$pr ==="
  gh pr view $pr --json title,mergeStateStatus,statusCheckRollup,files
done
\`\`\`

#### Step 2: CI失敗修正
\`\`\`bash
# PowerShell構文修正 (PR #208)
git checkout feat/powershell構文ci
find . -name "*.ps1" -exec sed -i '1s/^\xEF\xBB\xBF//' {} \;
powershell -Command "Get-ChildItem -Recurse -Filter '*.ps1' | ForEach-Object { Test-Path $_.FullName }"

# ESLint設定修正 (PR #147, #146)
git checkout eslint-dev-dependencies
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx eslint . --fix
\`\`\`

#### Step 3: 競合解決
\`\`\`bash
# 各PRのrebase実行
for pr in 209 208 202 183 181 147 146 114; do
  PR_BRANCH=$(gh pr view $pr --json headRefName --jq -r '.headRefName')
  git checkout $PR_BRANCH
  git rebase main
  git push --force-with-lease origin $PR_BRANCH
done
\`\`\`

#### Step 4: 順次マージ
\`\`\`bash
# 依存関係を考慮した順序でマージ
MERGE_ORDER=(208 147 146 181 202 183 114 209)
for pr in "${MERGE_ORDER[@]}"; do
  gh pr merge $pr --squash --delete-branch
  echo "✅ PR #$pr マージ完了"
done
\`\`\`

### 🔧 技術的詳細

#### PowerShell問題解決
- BOM文字除去: `sed -i '1s/^\xEF\xBB\xBF//' *.ps1`
- 構文チェック: PowerShell AST使用
- CI設定: GitHub Actions Windows runner

#### ESLint統合
- Next.js設定: `@next/eslint-config-next`
- TypeScript対応: `@typescript-eslint/*`
- 自動修正: `--fix`オプション

#### 依存関係管理
- renovate設定: `.github/renovate.json`
- mergify設定: `.mergify.yml`
- package.json統合

### 🎯 成功指標

#### 完了条件
- [ ] 8個のPR全てマージ完了
- [ ] CI/CD全て成功
- [ ] Issues 1個のみ残存（開発開始宣言）
- [ ] 重心ケアアプリ正常動作確認

#### 検証方法
\`\`\`bash
# 最終確認
gh pr list --state open  # 0個であること
gh issue list --state open  # 1個のみであること
npm run build  # ビルド成功
npm run test   # テスト成功
\`\`\`

### 🚀 次期開発計画

#### 重心ケアアプリ拡張
1. **AI分析機能**: ケアデータの傾向分析
2. **データベース統合**: Supabase連携
3. **多施設対応**: マルチテナント機能
4. **モバイルアプリ**: PWA → ネイティブアプリ

#### 技術的改善
1. **パフォーマンス最適化**: React.memo、useMemo活用
2. **アクセシビリティ向上**: WCAG 2.1 AA準拠
3. **セキュリティ強化**: データ暗号化、認証強化
4. **テスト充実**: Jest、Playwright導入

---
**重要**: GitHub Copilotが失敗した課題を確実に解決し、重心ケアアプリの本格運用を実現してください。
