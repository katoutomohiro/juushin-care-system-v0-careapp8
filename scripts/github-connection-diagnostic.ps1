# GitHub接続診断スクリプト (PowerShell版)

Write-Host "=== GitHub接続診断スクリプト ===" -ForegroundColor Magenta

Write-Host "Goal: Diagnose why 'GitHub の読み込みに失敗しました' と表示され、GitHub と同期できない" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify current Git remotes
Write-Host "--- Step 1: Git remotes確認 ---" -ForegroundColor Yellow
Write-Host "Running: git remote -v" -ForegroundColor Gray
git remote -v
Write-Host ""

# Step 2: Check repository status
Write-Host "--- Step 2: リポジトリ状況確認 ---" -ForegroundColor Yellow
Write-Host "Running: git status" -ForegroundColor Gray
git status
Write-Host ""

# Step 3: Test network/auth connectivity using GitHub CLI
Write-Host "--- Step 3: GitHub CLI認証確認 ---" -ForegroundColor Yellow
Write-Host "Running: gh auth status" -ForegroundColor Gray
try {
    $ghStatus = gh auth status 2>&1
    Write-Host $ghStatus -ForegroundColor Green
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Not logged in. Please run: gh auth login" -ForegroundColor Red
    } else {
        Write-Host "Running: gh repo view katoutomohiro/v0-git-hub-project-soul-care-system --web" -ForegroundColor Gray
        gh repo view katoutomohiro/v0-git-hub-project-soul-care-system --web 2>&1
    }
} catch {
    Write-Host "GitHub CLI not installed or not available" -ForegroundColor Red
}
Write-Host ""

# Step 4: Fetch from origin to confirm credentials
Write-Host "--- Step 4: Origin fetch確認 ---" -ForegroundColor Yellow
Write-Host "Running: git fetch origin" -ForegroundColor Gray
try {
    git fetch origin 2>&1
    $FETCH_RESULT = $LASTEXITCODE
    if ($FETCH_RESULT -eq 0) {
        Write-Host "✅ Fetch succeeded" -ForegroundColor Green
    } else {
        Write-Host "❌ Fetch failed with exit code: $FETCH_RESULT" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Fetch failed with exception: $_" -ForegroundColor Red
    $FETCH_RESULT = 1
}
Write-Host ""

# Step 5: Test push (dry-run)
Write-Host "--- Step 5: Push dry-run テスト ---" -ForegroundColor Yellow
Write-Host "Running: git push --dry-run origin main" -ForegroundColor Gray
try {
    git push --dry-run origin main 2>&1
    $PUSH_RESULT = $LASTEXITCODE
    if ($PUSH_RESULT -eq 0) {
        Write-Host "✅ Push dry-run succeeded" -ForegroundColor Green
    } else {
        Write-Host "❌ Push dry-run failed with exit code: $PUSH_RESULT" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Push dry-run failed with exception: $_" -ForegroundColor Red
    $PUSH_RESULT = 1
}
Write-Host ""

# Step 6: Summarize findings
Write-Host "--- Step 6: 診断結果まとめ ---" -ForegroundColor Yellow
Write-Host "Remote URLs:" -ForegroundColor Cyan
git remote -v
Write-Host ""

$authStatus = try { gh auth status 2>&1 | Select-Object -First 1 } catch { "GitHub CLI not available" }
Write-Host "Auth status: $authStatus" -ForegroundColor Cyan
Write-Host "Fetch result: $(if ($FETCH_RESULT -eq 0) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor Cyan
Write-Host "Push dry-run result: $(if ($PUSH_RESULT -eq 0) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor Cyan
Write-Host ""

if ($FETCH_RESULT -ne 0 -or $PUSH_RESULT -ne 0) {
    Write-Host "推奨対応:" -ForegroundColor Yellow
    Write-Host "- 認証の再設定: gh auth login" -ForegroundColor White
    Write-Host "- リモートURL再設定: git remote set-url origin https://github.com/katoutomohiro/v0-git-hub-project-soul-care-system.git" -ForegroundColor White
    Write-Host "- SSH鍵の確認: ssh -T git@github.com" -ForegroundColor White
}

Write-Host "診断完了" -ForegroundColor Green
