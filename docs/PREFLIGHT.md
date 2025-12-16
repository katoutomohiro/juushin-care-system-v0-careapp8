# PREFLIGHT.md - 変更前後の検証手順

> **🔖 この文書は「正本（Source of Truth）」です**  
> コード変更の前後で必ず実行する検証手順が定義されています。

**更新日**: 2025-12-16

## 実行可能なコマンド（package.json scripts）

- ✅ `pnpm lint` - ESLint実行
- ✅ `pnpm typecheck` - TypeScript型チェック（tsc --noEmit）
- ✅ `pnpm build` - Next.js本番ビルド（時間かかる場合は省略可）
- ✅ `pnpm test` - Vitest単体テスト実行
- ✅ `pnpm ai:snapshot` - プロジェクト現状スナップショット生成

## 📸 スナップショット生成（推奨）

作業開始前・作業終了後にプロジェクトの現状を記録：

```powershell
pnpm ai:snapshot
```

- **出力**: `docs/SNAPSHOT.md`
- **内容**: Git状態、lint/typecheck結果、変更ファイル一覧、次タスク
- **用途**: 新しいAIチャットで現状を伝える際に全文コピペ

## 🎯 GitHub テンプレート活用

### Issue 作成時
`.github/ISSUE_TEMPLATE/` から適切なテンプレートを選択：
- **bug_report.md**: バグ報告
- **feature_request.md**: 新機能提案
- **ui_improvement.md**: UI/UX改善

### Pull Request 作成時
`.github/pull_request_template.md` が自動適用されます。  
変更内容・テスト手順・チェックリストを埋めてください。

## 📝 ADR（Architecture Decision Records）

重要な技術的決定を記録する場合：

1. `docs/adr/ADR-TEMPLATE.md` をコピー
2. 連番を付けてリネーム（例: `ADR-002-nextjs-15-migration.md`）
3. 内容を記入してコミット

**参考**: [ADR-001-adr-introduction.md](adr/ADR-001-adr-introduction.md)

## プレフライト手順（変更前）

### 1. ログディレクトリ作成
```powershell
New-Item -ItemType Directory -Force -Path logs
```

### 2. lint 実行
```powershell
pnpm lint > logs/before-lint.txt 2>&1
```

### 3. typecheck 実行
```powershell
pnpm typecheck > logs/before-typecheck.txt 2>&1
```

### 4. エラーカウント（要約）
```powershell
# lint
Select-String "problems|errors|warnings" logs/before-lint.txt

# typecheck
Select-String "Found.*errors" logs/before-typecheck.txt
```

### 5. 現状記録
- lint の警告数（warnings）
- typecheck のエラー数（errors）
- 上記を docs/AI_CONTEXT.md に記録

## ポストフライト手順（変更後）

### 1. lint 実行
```powershell
pnpm lint > logs/after-lint.txt 2>&1
```

### 2. typecheck 実行
```powershell
pnpm typecheck > logs/after-typecheck.txt 2>&1
```

### 3. 差分確認
```powershell
# lint 比較
Compare-Object (Get-Content logs/before-lint.txt) (Get-Content logs/after-lint.txt)

# typecheck 比較（エラー数だけ）
Select-String "Found.*errors" logs/before-lint.txt
Select-String "Found.*errors" logs/after-lint.txt
```

### 4. 受入条件チェック
- [ ] lint の warnings/errors が増えていない（減っていればOK）
- [ ] typecheck の errors が増えていない（減っていればOK）
- [ ] ブラウザConsoleで `/api/case-records` の500連打が止まっている
- [ ] A.Tページでケース記録フォームが表示される
- [ ] A.T以外の利用者の日誌記録が正常動作する

## ブラウザ動作確認

### A.T専用ページ
1. `http://localhost:3000/services/life-care/users/A・T` にアクセス
2. DevTools Console を開く（F12）
3. "ケース記録入力（A4印刷対応）" カードをクリック
4. フォームが表示されることを確認
5. Console に `/api/case-records` の500エラーが連打されていないことを確認

### その他の利用者ページ
1. A.T以外の利用者（例: 山田太郎さん）のページにアクセス
2. "日誌記録" カードをクリック
3. 日誌カテゴリ一覧が表示されることを確認
4. Console にエラーがないことを確認

## トラブルシューティング

### lint で新規警告が出た場合
- 該当行を確認し、コメント修正 or eslint-disable で対処
- ただし、むやみに eslint-disable を増やさない

### typecheck で新規エラーが出た場合
- 型定義を確認し、必要なら型アサーションまたは型ガード追加
- any は最終手段（使わない方針）

### ブラウザ動作確認でエラーが出た場合
- Network タブで API レスポンスを確認
- Console の詳細エラーメッセージを docs/AI_CONTEXT.md に記録
- 必要なら追加修正
