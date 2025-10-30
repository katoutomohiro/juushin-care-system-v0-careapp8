# マルチAIエージェント運用プラン v1

このドキュメントは、GitHub Copilot Coding Agent を複数の専門役割で運用するための戦略と定型プロンプト集です。

## 1. エージェント役割（ラベル運用）

PRに以下のラベルを付けることで、Copilot Coding Agentが担当領域を明確に認識します：

- **agent:release** - リリースPR解除・タグ/Release作成・一時CIブリッジ→掃除PR
- **agent:code** - 実装（小粒PR、差分最小、型安全・後方互換）
- **agent:test** - UT/IT生成、失敗テストの原因特定、安定化
- **agent:e2e** - Playwrightでダウンロード検証や回帰E2E
- **agent:docs** - 運用手順・README・リリースノート
- **agent:security** - 依存・CI・シークレット・PIIマスク方針監査
- **agent:i18n** - 日英文書化・UI文言差し替え

## 2. Slack連携・起動チェック（最短手順）

1. Slackの対象チャンネルに GitHubアプリ と Copilot Coding Agent を追加
2. Slackで `/github subscribe katoutomohiro/juushin-care-system-v0-careapp8`
3. 反応を確認（PR/CIイベントが流れる）
4. 下の"監視スレッド起動"プロンプトを投下して、運転開始

## 3. 即戦力プロンプト（コピペ用）

### A. 監視スレッド起動（PR & Vercel遅延監視）

```text
@GitHub Copilot Coding Agent
repo: katoutomohiro/juushin-care-system-v0-careapp8
labels: agent:release, agent:e2e
Goal: オープンPR(#91, #92, #93)のCIとVercelチェックを監視。20分以上PENDINGのチェックを検出したら、原因候補（未実行の必須チェック名／ブランチBEHIND／ワークフロー未紐付け）をコメント報告し、可能なら再実行・リトライを実施。
Deliverables: 監視結果の要約コメント、必要な再実行コマンド、該当URL。
Constraints: main直コミット禁止 / シークレットやPIIに触れない / 小粒変更のみ
```

### B. #91（BEHIND）の解消（リベース→自動マージ維持）

```text
@GitHub Copilot Coding Agent
repo: katoutomohiro/juushin-care-system-v0-careapp8
labels: agent:release
Goal: PR #91 (chore/cleanup-bridge-ci-v0-11-0) を最新 main にリベースし、必須チェック(build-test, tests, ai-agent-review, agent-runner)が走る状態に調整。すべて成功後は既に設定済みの auto-merge を維持。
Deliverables: 実施ログ、必要に応じたCI名の整合コメント（「ジョブ名と保護設定名の一致」）
Constraints: ワークフロー名は保護設定と一致させる。変更は最小限。PII/Secrets非接触。
```

### C. #92 / #93（BLOCKED: CI中）— 成功までの"詰め"

```text
@GitHub Copilot Coding Agent
repo: katoutomohiro/juushin-care-system-v0-careapp8
labels: agent:test, agent:e2e, agent:docs
Goal: PR #92/#93 のCI必須チェック完了を最短で通す。E2E既存失敗は責任範囲外だが、今回の変更の影響有無を素早く切り分けるため、flaky度合い診断と暫定隔離（tag付け or retry-logic）を提案し、必要なら一時的にテストを quarantine タグで除外→別Issue起票。
Deliverables: 切り分けレポート、必要なPRコメント、再実行結果。
Constraints: 本件の差分以外の大改修はしない。除外は期限と復帰計画をコメントで明示。
```

### D. 失敗E2Eの安定化（回帰を防ぐ最小変更）

```text
@GitHub Copilot Coding Agent
repo: katoutomohiro/juushin-care-system-v0-careapp8
labels: agent:e2e, agent:test
Goal: UI統合系の既存E2Eの flaky を下げる。待機の明示化（getByRole + expect.toBeVisible + download完成待ち）、timezone固定、networkidle待機を導入。今回の変更と無関係のテストは quarantine タグを導入し、別Issueに切り出し。
Deliverables: 小粒PR（tests/e2e/* のみ）、テスト安定化の説明コメント、再実行ログ。
Constraints: 本体コードは触らない。PRは最小差分・1トピック。
```

### E. 次のリリース v0.11.1（定型運用）

```text
@GitHub Copilot Coding Agent
repo: katoutomohiro/juushin-care-system-v0-careapp8
labels: agent:release, agent:docs
Goal: v0.11.1 のパッチリリースを作成。Changelog生成→Release PR→必須チェック通過→タグ/Release作成。ブリッジCIは原則使わず、ワークフロー名を保護設定に合わせて整合。必要なら保護設定名の軽微調整を提案。
Deliverables: Release PR URL、生成されたリリースノート、タグ/Release URL。
Constraints: main直コミット禁止、PII/Secrets非接触。
```

## 4. CIジョブ名の固定化（ブリッジ不要にする）

ブランチ保護の必須チェック名とワークフローの `job.name` を一致させることで、一時的なブリッジワークフローが不要になります。

**現在の必須チェック名**: `build-test`, `tests`, `ai-agent-review`, `agent-runner`

### 推奨ワークフロー構造

```yaml
# .github/workflows/ci.yml
name: ci

on:
  pull_request:
    branches: [ main ]

jobs:
  build-test:
    name: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  tests:
    name: tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec vitest run --reporter=dot

  ai-agent-review:
    name: ai-agent-review
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # LLMベースの静的レビュー or ルールチェック置き場
      - run: node scripts/agent-review.mjs

  agent-runner:
    name: agent-runner
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # 軽量E2Eや整合チェック、Vercel ping など
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test --project=chromium --reporter=line
```

**注意**: 将来 `e2e-test` を保護に追加したい場合は、ジョブ名 `e2e-test` を増設し、保護設定側にも同名を登録してください。

## 5. PIIマスクの単一ソース化（CSV/PDF共通）

`config/pii-mask.json` で `maskFields` を集中管理し、`exportAsCsvV2` / `exportAsPdf` はこの設定を既定読み込みします（UI側で追加上書き可能）。

**ファイル**: `config/pii-mask.json`

```json
{
  "defaultMask": ["note", "memo", "familyContact"],
  "categories": {
    "freeText": ["note", "memo"],
    "contact": ["familyContact", "emergencyContact"],
    "medical": ["medication", "diagnosis"]
  }
}
```

**使用例**:

```typescript
import piiConfig from '@/config/pii-mask.json'

// デフォルトマスクを使用
exportAsCsvV2(data, columns, { maskFields: piiConfig.defaultMask })

// カテゴリ別にマスクを拡張
const maskAll = [...piiConfig.categories.freeText, ...piiConfig.categories.contact]
exportAsPdf(data, columns, { maskFields: maskAll })
```

## 6. 安全運用ガードレール

1. **1PR=1トピック** / main直コミット禁止 / 既存機能を壊さない（後方互換）
2. **PIIは原則常時マスク**（config集中管理）
3. **失敗E2Eは切り分け→隔離→Issue化→後追い修復**
4. **ブリッジCIは緊急時のみ**、原則はジョブ名＝保護名で固定
5. **シークレット/環境変数に触らない**
6. **すべての作業ログをスレッドに残す**

## 次の一手

1. まずは **「A. 監視スレッド起動」** をSlackに投下
2. 続けて **「B. #91リベース」**、**「C. #92/#93通過支援」** を順番に投下
3. CIジョブ名が固定に揃っていなければ、最小差分PRで名称整合を出し、以後ブリッジ不要に

この流れで、**開発速度＝短サイクルの小粒PR×自動化** を最大化できます。

---

**関連ドキュメント**:

- [Copilot Coding Agent運用手順（Slack連携）](./copilot-coding-agent-ops.md)
- [GitHub移行ガイド](./github-migration-guide.md)
