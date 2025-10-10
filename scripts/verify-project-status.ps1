# 重心ケアアプリ プロジェクト状況確認 (PowerShell版)

Write-Host "=== 重心ケアアプリ プロジェクト状況確認 ===" -ForegroundColor Magenta

# ファイル存在確認
Write-Host "--- ファイル存在確認 ---" -ForegroundColor Yellow
Get-ChildItem -Path "app" -Filter "page*.tsx" -ErrorAction SilentlyContinue | Select-Object Name, Length

# TypeScript確認
Write-Host "--- TypeScript確認 ---" -ForegroundColor Yellow
try {
    npx tsc --noEmit 2>&1 | Tee-Object -FilePath "ts_check.log"
    $ERROR_COUNT = (Select-String -Path "ts_check.log" -Pattern "error TS" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "TypeScriptエラー数: $ERROR_COUNT" -ForegroundColor Cyan
} catch {
    Write-Host "TypeScript確認失敗: $_" -ForegroundColor Red
}

# ビルド確認
Write-Host "--- ビルド確認 ---" -ForegroundColor Yellow
try {
    pnpm build 2>&1 | Tee-Object -FilePath "build_check.log"
    $BUILD_RESULT = $LASTEXITCODE
    Write-Host "ビルド結果: $(if ($BUILD_RESULT -eq 0) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor Cyan
} catch {
    Write-Host "ビルド確認失敗: $_" -ForegroundColor Red
}

# 文字化けチェック
Write-Host "--- 文字化けチェック ---" -ForegroundColor Yellow
if (Test-Path "app/page.tsx") {
    $content = Get-Content "app/page.tsx" -Raw -Encoding UTF8
    if ($content -match "蛻|譌") {
        Write-Host "❌ 文字化け検出" -ForegroundColor Red
        Select-String -Path "app/page.tsx" -Pattern "蛻|譌" | Select-Object -First 5
    } else {
        Write-Host "✅ 文字化けなし" -ForegroundColor Green
    }
} else {
    Write-Host "app/page.tsx not found" -ForegroundColor Red
}

Write-Host "=== 確認完了 ===" -ForegroundColor Magenta
