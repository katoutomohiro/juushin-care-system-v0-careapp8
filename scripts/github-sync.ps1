# GitHub同期スクリプト (PowerShell版)
Write-Host "=== GitHub同期開始 ===" -ForegroundColor Magenta

# 現在のGit状況確認
Write-Host "--- 現在のGit状況 ---" -ForegroundColor Yellow
git status
git remote -v

# 最新のリモートリポジトリから取得
Write-Host "--- リモートから最新版を取得 ---" -ForegroundColor Yellow
git fetch origin

# ローカルの変更をコミット（必要に応じて）
Write-Host "--- ローカル変更の確認 ---" -ForegroundColor Yellow
$changes = git status --porcelain
if ($changes) {
    Write-Host "ローカルに未コミットの変更があります" -ForegroundColor Cyan
    git add .
    git commit -m "sync: local changes before GitHub sync"
}

# リモートの最新版とマージ
Write-Host "--- リモートとマージ ---" -ForegroundColor Yellow
git pull origin main

# プッシュ
Write-Host "--- リモートにプッシュ ---" -ForegroundColor Yellow
git push origin main

Write-Host "✅ GitHub同期完了" -ForegroundColor Green
