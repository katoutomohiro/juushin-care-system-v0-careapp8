# 重心ケアアプリ TypeScript状況確認スクリプト

Write-Host "=== 重心ケアアプリ TypeScript状況確認 ===" -ForegroundColor Magenta

# Step 1: ファイル存在確認
Write-Host "--- Step 1: ファイル存在確認 ---" -ForegroundColor Yellow
Write-Host "app/page.tsx存在: $(Test-Path 'app/page.tsx')" -ForegroundColor Cyan
Write-Host "app/page_utf8.tsx存在: $(Test-Path 'app/page_utf8.tsx')" -ForegroundColor Cyan

# Step 2: TypeScript型チェック
Write-Host "--- Step 2: TypeScript型チェック ---" -ForegroundColor Yellow
npx tsc --noEmit 2>&1 | Tee-Object -FilePath "ts_check.log"
$ERROR_COUNT = (Select-String -Path "ts_check.log" -Pattern "error TS" | Measure-Object).Count
Write-Host "TypeScriptエラー数: $ERROR_COUNT" -ForegroundColor Cyan

# Step 3: ビルド確認
Write-Host "--- Step 3: ビルド確認 ---" -ForegroundColor Yellow
if ($ERROR_COUNT -eq 0) {
    Write-Host "TypeScriptエラー0件 - ビルド実行" -ForegroundColor Green
    pnpm build
    $BUILD_RESULT = $LASTEXITCODE
    Write-Host "ビルド結果: $(if ($BUILD_RESULT -eq 0) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor Cyan
} else {
    Write-Host "TypeScriptエラー残存 - ビルドスキップ" -ForegroundColor Yellow
}

# Step 4: 結果サマリー
Write-Host "--- Step 4: 結果サマリー ---" -ForegroundColor Yellow
Write-Host "TypeScriptエラー: $ERROR_COUNT 件" -ForegroundColor Cyan
Write-Host "ビルド: $(if ($BUILD_RESULT -eq 0) { '✅ 成功' } else { '❌ 失敗' })" -ForegroundColor Cyan

if ($ERROR_COUNT -eq 0 -and $BUILD_RESULT -eq 0) {
    Write-Host "🎊 Phase 2-A完全成功" -ForegroundColor Green
    Write-Host "重心ケアアプリ基盤完全安定化" -ForegroundColor Green
} else {
    Write-Host "⚠️ 追加対応が必要" -ForegroundColor Yellow
}
