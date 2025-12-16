# PREFLIGHT.md - 変更前後の検証手順

**更新日**: 2025-12-16

## 実行可能なコマンド（package.json scripts）

- ✅ `pnpm lint` - ESLint実行
- ✅ `pnpm typecheck` - TypeScript型チェック（tsc --noEmit）
- ✅ `pnpm build` - Next.js本番ビルド（時間かかる場合は省略可）
- ✅ `pnpm test` - Vitest単体テスト実行

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
