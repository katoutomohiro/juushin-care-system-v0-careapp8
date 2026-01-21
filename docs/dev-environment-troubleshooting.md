# 開発環境トラブルシューティング

## 開発サーバー起動手順

### 通常起動
```powershell
pnpm dev
```

### クリーン起動（推奨：ChunkLoadError/Invalid token が頻発する場合）
```powershell
pnpm dev:clean
```

### ポート3000が使用中の場合
```powershell
# ポート3000を強制終了してから起動
npx kill-port 3000
pnpm dev
```

または、別のポートで起動：
```powershell
pnpm dev -- -p 3001
```

## よくあるエラーと対処法

### 1. ChunkLoadError
**症状**: ブラウザコンソールに `ChunkLoadError: Loading chunk xxx failed` が表示される

**対処法**:
1. **Ctrl+F5** でブラウザのハードリフレッシュ
2. それでも解決しない場合は `.next` を削除して再起動：
   ```powershell
   pnpm dev:clean
   ```

### 2. Invalid token / Unexpected token エラー
**症状**: ターミナルに `SyntaxError: Invalid or unexpected token` が表示される

**対処法**:
1. ターミナルのエラーメッセージで該当ファイル（例: `layout.tsx`）を確認
2. 該当ファイルの構文エラーを修正
3. 保存すると自動的に再コンパイルされる

### 3. Port already in use (EADDRINUSE)
**症状**: `Error: listen EADDRINUSE: address already in use :::3000`

**対処法**:
```powershell
# 方法1: ポートを強制終了
npx kill-port 3000

# 方法2: プロセスIDを確認して終了
netstat -ano | findstr :3000
taskkill /F /PID <プロセスID>

# 方法3: 別のポートで起動
pnpm dev -- -p 3001
```

### 4. webpack cache エラー
**症状**: `incorrect header check` などのキャッシュ関連エラー

**対処法**:
```powershell
# .next ディレクトリを削除してクリーン起動
pnpm dev:clean
```

## 開発サーバー運用のベストプラクティス

### 推奨起動手順
```powershell
# 1. 既存のポート3000プロセスを終了
npx kill-port 3000

# 2. クリーン起動
pnpm dev:clean
```

### コード変更時の注意点
- **大規模な変更後**: `.next` を削除してから起動（`pnpm dev:clean`）
- **依存関係の変更**: `pnpm install` 後に必ず `.next` を削除
- **エラーが出た場合**: まず Ctrl+F5 でブラウザリフレッシュ、次に `pnpm dev:clean`

### TypeScript/ESLint エラーの確認
```powershell
# 型チェック
pnpm typecheck

# Lint チェック
pnpm lint --max-warnings=0

# ビルド確認
pnpm build
```

## 緊急時の完全リセット手順

すべてがうまくいかない場合：

```powershell
# 1. 開発サーバーを停止（Ctrl+C）

# 2. ビルドキャッシュとnode_modulesを削除
Remove-Item -Recurse -Force .next, node_modules

# 3. 依存関係を再インストール
pnpm install

# 4. クリーン起動
pnpm dev:clean
```

## 参考情報

- **Next.js キャッシュ**: `.next/cache` にwebpackキャッシュが保存される
- **ポート変更**: 環境変数 `PORT=3001 pnpm dev` でもポート指定可能
- **ログ確認**: ターミナル出力に `[webpack.cache]` や `Compiling` などのメッセージを確認
