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

### 🚀 起動フロー（Windows PowerShell）

#### **通常の開発サイクル**

```powershell
# ターミナル1: Dev サーバー起動（一度起動したら触らない）
pnpm run dev

# ターミナル2: コード編集 & コミット
# (自由に編集・テスト)
pnpm lint
pnpm typecheck
git commit ...
```

**重要**: `pnpm run dev` は独立したターミナルで起動し、そのターミナルでは他のコマンドを実行しないでください。

#### **トラブル時（画面真っ白 / ChunkLoadError / 接続拒否）**

```powershell
# ワンコマンドで復旧
pnpm run reboot

# または手動で段階実行
pnpm run port:free     # ポート3000を解放
pnpm run dev:clean     # キャッシュ削除 + 起動
```

#### **ブラウザ確認**

- **常に** `http://localhost:3000` にアクセス
- もし `3001` などに飛んだ → dev サーバーが起動していない → `pnpm run reboot` で復旧

### 📋 Scripts 一覧

| Command | 説明 |
|---------|------|
| `pnpm dev` | ポート3000でNext.jsを起動（常時稼働）|
| `pnpm dev:clean` | .nextキャッシュ削除 + 起動 |
| `pnpm port:free` | ポート3000を掴むプロセスをKill |
| `pnpm reboot` | port:free + dev:clean（フル復旧） |
| `pnpm lint` | ESLint実行 |
| `pnpm typecheck` | TypeScript型チェック |
| `pnpm build` | 本番ビルド |

### ✅ Dev サーバー起動確認

`pnpm run dev` 実行後、ターミナルに以下が表示されることを確認：

```
✓ Ready in Xs
- Local:        http://localhost:3000
- Environments: .env.local
```

**✅ OK**: プロンプトが戻らず、上記ログが表示され続ける  
**❌ NG**: プロンプトが戻る、エラーが出ている

### 🔧 ポート3000が既に使用中の場合

```powershell
# 自動解放
pnpm run port:free

# または手動確認
netstat -ano | findstr :3000
taskkill /PID <PID> /F
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
