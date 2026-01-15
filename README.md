# careapp3

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/pinokiotomo-7421s-projects/v0-careapp3-e0)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/PfVKEiHybWJ)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Collaboration handbook

All contributors (オーナー、ChatGPT、GitHub Copilot、v0) must review and follow the consolidated workflow described in [`docs/ai-collaboration-handbook.md`](docs/ai-collaboration-handbook.md) before starting any task. Confirm "ハンドブック確認済み" in your activity logs at the beginning of each cycle, and revisit the handbook whenever the update log indicates new guidance.

## Auto-Merge System 🚀

**Status**: 🟢 Production (100% success rate, 7/7 PRs validated)

This repository uses an automated PR merge system with dual quality gates:
- ✅ **Vercel Preview Comments** - Deployment validation
- ✅ **SonarCloud Code Analysis** - Code quality & security

**Quick Start**:
```powershell
# Enable auto-merge on PR
gh pr edit <PR_NUMBER> --add-label "ux-ready"
```

**Documentation**:
- 📖 [Quick Reference](docs/QUICK_REFERENCE.md) - Essential commands
- 📚 [Operations Manual](docs/operations-manual.md) - Complete guide
- 🔧 [CI Auto-Merge Guide](docs/ci-automerge-guide.md) - Technical details

## Deployment

Your project is live at:

**[https://vercel.com/pinokiotomo-7421s-projects/v0-careapp3-e0](https://vercel.com/pinokiotomo-7421s-projects/v0-careapp3-e0)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/PfVKEiHybWJ](https://v0.app/chat/projects/PfVKEiHybWJ)**

## Development

### 環境要件

- **Node.js**: v18.17+ （推奨: v20 LTS）
- **pnpm**: v8+
- **OS**: Windows PowerShell 推奨（MacOS/Linux も対応）

### 🚀 推奨スタートアップ

```powershell
# 【最初はこれだけ】
pnpm run reboot
```

これで以下が自動実行されます：
1. ポート3000を掴んでるプロセスをKill
2. `.next` キャッシュを削除
3. 新しいPowerShellウィンドウでNext.js dev サーバー起動

**重要**: 起動後、新しいPowerShellウィンドウが開きます。そのウィンドウは閉じずに放置してください。

### ✅ 接続確認

```powershell
# サーバーが起動しているか確認
pnpm run check-server
```

成功すると以下が表示されます：
```
⏳ Checking http://localhost:3000 .....
✅ Server is responding on http://localhost:3000
   Status: 404
```

その後、ブラウザで `http://localhost:3000` を開いてアプリが見えるか確認。

### 📋 Scripts 一覧

| Command | 説明 |
|---------|------|
| `pnpm run reboot` | ✅ **推奨**：ワンコマンド復旧（port解放→キャッシュ削除→起動） |
| `pnpm run check-server` | サーバー接続テスト（失敗時は詳細メッセージ） |
| `pnpm run port:free` | ポート3000を掴むプロセスをKill |
| `pnpm dev` | Next.jsサーバー直接起動（ポート3000） |
| `pnpm dev:clean` | .nextキャッシュ削除のみ |
| `pnpm lint` | ESLint実行 |
| `pnpm typecheck` | TypeScript型チェック |
| `pnpm build` | 本番ビルド |

### 🔧 トラブル対応

#### 問題: PowerShell 終了時に「バッチ ジョブを終了しますか？」が出る

```powershell
# クリーンアップスクリプトを実行
.\scripts\cleanup-jobs.ps1

# その後 PowerShell を終了
exit
```

**原因**: バックグラウンドジョブが残っている  
**永久対策**: [PowerShell プロファイル設定](docs/POWERSHELL_PROFILE_SETUP.md)を参照し、終了時の自動クリーンアップを有効化

#### 問題: ERR_CONNECTION_REFUSED が出る

```powershell
# 解決策1：ワンコマンド復旧
pnpm run reboot

# その後確認
pnpm run check-server
```

#### 問題: 画面が真っ白 / ChunkLoadError

```powershell
pnpm run port:free
pnpm run dev:clean
pnpm run reboot
```

#### 問題: ポート3000がどうしても塞がっている

```powershell
# 手動確認
netstat -ano | findstr :3000

# 結果の PID をKill
taskkill /PID <PID> /F

# その後
pnpm run reboot
```

### 📝 Dev:clean の動作

- `.next` ビルドキャッシュを削除するだけ（起動はしません）
- **Windows + Node v24 環境での安定性のため、起動は必ず `pnpm dev` で行ってください**
- spawn 経由のプロセス起動は EINVAL エラーの原因となるため、キャッシュ削除と起動を分離しています

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

<!-- Trigger SonarCloud reanalysis (2025-12-19) -->

<!-- SonarCloud reanalysis trigger -->
