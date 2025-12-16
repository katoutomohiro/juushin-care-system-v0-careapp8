#!/usr/bin/env node
/**
 * ai:snapshot - プロジェクトの現状スナップショットを生成
 * 
 * 実行: pnpm ai:snapshot
 * 出力: docs/SNAPSHOT.md
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function getGitInfo() {
  const branch = exec('git rev-parse --abbrev-ref HEAD');
  const commit = exec('git rev-parse --short HEAD');
  const commitMsg = exec('git log -1 --pretty=%s');
  const commitDate = exec('git log -1 --pretty=%ci');
  return { branch, commit, commitMsg, commitDate };
}

function getLintSummary() {
  const result = exec('pnpm lint 2>&1');
  const match = result.match(/(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/);
  if (match) {
    return { problems: match[1], errors: match[2], warnings: match[3] };
  }
  return { problems: '0', errors: '0', warnings: '0' };
}

function getTypecheckSummary() {
  const result = exec('pnpm typecheck 2>&1');
  const match = result.match(/Found\s+(\d+)\s+errors?/);
  if (match) {
    return { errors: match[1] };
  }
  // エラーがない場合
  if (result.includes('tsc --noEmit') && !result.includes('error TS')) {
    return { errors: '0' };
  }
  return { errors: 'N/A' };
}

function getChangedFiles() {
  const staged = exec('git diff --cached --name-only');
  const unstaged = exec('git diff --name-only');
  return {
    staged: staged ? staged.split('\n') : [],
    unstaged: unstaged ? unstaged.split('\n') : []
  };
}

function getRecentTasks() {
  // AI_CONTEXT.md から「次のステップ」セクションを抽出
  const aiContextPath = path.join(__dirname, '..', 'docs', 'AI_CONTEXT.md');
  if (!fs.existsSync(aiContextPath)) return [];
  
  const content = fs.readFileSync(aiContextPath, 'utf8');
  const match = content.match(/### 次のステップ.*?\n([\s\S]*?)(?=\n##|$)/);
  if (!match) return [];
  
  return match[1]
    .split('\n')
    .filter(line => line.trim().match(/^\d+\.|^-/))
    .map(line => line.trim());
}

function generateSnapshot() {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const git = getGitInfo();
  const lint = getLintSummary();
  const typecheck = getTypecheckSummary();
  const files = getChangedFiles();
  const tasks = getRecentTasks();

  const snapshot = `# SNAPSHOT.md - プロジェクト現状スナップショット

> **✨ 新しいチャットで貼るのはこれだけでOK ✨**  
> このファイルは \`pnpm ai:snapshot\` で自動生成されます。  
> AIアシスタントに現状を伝える際は、このファイル全体をコピペしてください。

**生成日時**: ${now}

---

## 📍 Gitステータス

- **ブランチ**: \`${git.branch}\`
- **コミット**: \`${git.commit}\`
- **最新コミットメッセージ**: ${git.commitMsg}
- **コミット日時**: ${git.commitDate}

---

## 🔍 品質チェック

### lint
- **Problems**: ${lint.problems} (Errors: ${lint.errors}, Warnings: ${lint.warnings})

### typecheck
- **Errors**: ${typecheck.errors}

---

## 📝 変更ファイル

### ステージング済み（Staged）
${files.staged.length > 0 ? files.staged.map(f => `- ${f}`).join('\n') : '（なし）'}

### 未ステージング（Unstaged）
${files.unstaged.length > 0 ? files.unstaged.map(f => `- ${f}`).join('\n') : '（なし）'}

---

## 🎯 次のタスク（AI_CONTEXT.md より）

${tasks.length > 0 ? tasks.join('\n') : '（現在タスクなし - AI_CONTEXT.md を確認してください）'}

---

## 📚 正本ドキュメント（必読）

AIアシスタントは作業前に必ず以下を参照してください：

1. **[AI_CONTEXT.md](docs/AI_CONTEXT.md)** - 作業目的・背景・受入条件
2. **[ROUTE_MAP.md](docs/ROUTE_MAP.md)** - 画面・API・コンポーネント構造
3. **[PREFLIGHT.md](docs/PREFLIGHT.md)** - 変更前後の検証手順
4. **[AT_CASE_RECORD_SPEC.md](docs/AT_CASE_RECORD_SPEC.md)** - A.T専用ケース記録仕様

---

## 🛠️ よく使うコマンド

\`\`\`powershell
# 開発サーバー起動
pnpm dev

# lint 実行
pnpm lint

# typecheck 実行
pnpm typecheck

# スナップショット更新
pnpm ai:snapshot
\`\`\`

---

## 📖 その他のリソース

- **CHANGELOG.md**: プロジェクトの変更履歴
- **docs/adr/**: アーキテクチャ決定記録（ADR）
- **docs/MANUAL_TEST.md**: 実機確認手順書
- **.github/ISSUE_TEMPLATE/**: Issue テンプレート
- **.github/pull_request_template.md**: PR テンプレート
`;

  const outputPath = path.join(__dirname, '..', 'docs', 'SNAPSHOT.md');
  fs.writeFileSync(outputPath, snapshot, 'utf8');
  console.log(`✅ Snapshot generated: ${outputPath}`);
}

// 実行
generateSnapshot();
