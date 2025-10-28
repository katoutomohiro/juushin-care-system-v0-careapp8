# GitHub Actions Workflow Best Practices

このドキュメントでは、本プロジェクトのGitHub Actions ワークフローを安全に維持するためのベストプラクティスをまとめています。

## PR Context 参照のルール

### ❌ 避けるべきパターン

```yaml
# BAD: PRコンテキストを直接参照（pushイベントでnullになる）
steps:
  - name: Comment to PR
    run: echo "PR number is ${{ github.event.pull_request.number }}"
```

### ✅ 推奨パターン

```yaml
# GOOD: イベントタイプでガード
steps:
  - name: Comment to PR
    if: ${{ github.event_name == 'pull_request' }}
    run: echo "PR number is ${{ github.event.pull_request.number }}"
```

### ✅ より安全な二重ガード

```yaml
# BEST: ジョブレベル + ステップレベルの二重ガード
jobs:
  pr-specific-job:
    if: ${{ github.event_name == 'pull_request' }}
    steps:
      - name: Comment to PR
        if: ${{ always() && github.event_name == 'pull_request' }}
        run: echo "PR number is ${{ github.event.pull_request.number }}"
```

## Concurrency 設定のルール

### PR番号を優先するパターン

```yaml
concurrency:
  group: workflow-name-${{ (github.event.pull_request.number != null && format('pr-{0}', github.event.pull_request.number)) || github.ref }}
  cancel-in-progress: true
```

**理由**:
- PR番号が利用可能な場合はそれを使用（PR特有の並行制御）
- PR番号がない場合（pushイベント等）は`github.ref`にフォールバック
- `cancel-in-progress: true`で古い実行を自動キャンセル

### ワークフロー固有のグループ名

```yaml
# agent系ワークフロー（クロスワークフロー調整）
concurrency:
  group: agents-${{ (github.event.pull_request.number != null && format('pr-{0}', github.event.pull_request.number)) || github.ref }}

# その他のワークフロー（独立実行）
concurrency:
  group: workflow-name-${{ github.ref }}
```

## Paths Filter の使用ガイドライン

### 必須チェックの場合は避ける

```yaml
# ❌ BAD: 必須チェックでpaths filterを使うとマージブロックの原因に
on:
  pull_request:
    paths:
      - "specific/path/**"

jobs:
  required-check:
    runs-on: ubuntu-latest
    # このチェックが必須だと、paths外の変更でマージできない
```

### 推奨: 常に実行し、内部で条件判断

```yaml
# ✅ GOOD: 常に実行されるが、必要に応じてスキップ
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            src:
              - 'specific/path/**'
      
      - name: Run tests
        if: steps.changes.outputs.src == 'true'
        run: npm test
```

## トリガーイベントのガイドライン

### PR専用ワークフロー

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  pr-only-job:
    # job-level guardは任意（トリガー自体がPR限定なので）
    runs-on: ubuntu-latest
```

### Push + PR ワークフロー

```yaml
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    # PR特有の処理にはstep-level guardが必須
```

## Workflow Lint の活用

### actionlint による自動検証

`.github/workflows/workflow-lint.yml`が全てのワークフローファイルを自動検証します。

**検出される問題の例**:
- PRコンテキストの不適切な参照
- 存在しないアクションの使用
- 無効な式の構文
- セキュリティ上の懸念（スクリプトインジェクション等）

### ローカルでの検証

```powershell
# actionlintのインストール（初回のみ）
choco install actionlint

# 全ワークフローファイルの検証
actionlint .github/workflows/*.yml

# 特定ファイルの検証
actionlint .github/workflows/ci.yml
```

## トラブルシューティング

### PR #がnullエラー

**症状**: `Cannot read properties of null (reading 'number')`

**原因**: `github.event.pull_request`をpushイベントで参照

**解決策**: ステップに`if: github.event_name == 'pull_request'`を追加

### 必須チェックが表示されない

**症状**: PRがマージできない（必須チェック未実行）

**原因**: paths filterによりワークフローがスキップされた

**解決策**: 
1. paths filterを削除し、常に実行
2. または、ブランチ保護設定で「Require status checks to pass before merging」の「Require branches to be up to date before merging」を無効化

### Concurrency による予期しないキャンセル

**症状**: 実行中のワークフローが突然キャンセルされる

**原因**: 同じconcurrency groupの新しい実行が開始された

**解決策**: 
- PR番号を含むgroup名を使用して、PR毎に独立した並行制御を行う
- または、`cancel-in-progress: false`に変更（非推奨：リソース浪費）

## チェックリスト

新しいワークフローを追加する際は以下を確認：

- [ ] PRコンテキストを参照する場合、`if: github.event_name == 'pull_request'`ガードを追加
- [ ] Concurrency設定を追加（不要な重複実行を防止）
- [ ] 必須チェックにする場合、paths filterは避ける
- [ ] actionlintで検証を通過
- [ ] トリガーイベントが適切（pull_request, push, schedule等）
- [ ] Secretsの参照が適切（forkからのPRでは使用不可）

## 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/en/actions)
- [actionlint](https://github.com/rhysd/actionlint)
- [reviewdog/action-actionlint](https://github.com/reviewdog/action-actionlint)
- [本プロジェクトのCI履歴](https://github.com/katoutomohiro/juushin-care-system-v0-careapp8/actions)
