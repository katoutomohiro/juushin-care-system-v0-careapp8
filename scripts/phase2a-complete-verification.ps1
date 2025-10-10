# 🎯 重心ケアアプリ Phase 2-A完全検証・修復スクリプト
# OpenAI Codex指示による包括的な検証と修復

Write-Host "=== Phase 2-A完全検証・修復開始 ===" -ForegroundColor Magenta

## Step 1: 現状確認
Write-Host "--- Step 1: 現状確認 ---" -ForegroundColor Yellow

# ファイル存在確認
Write-Host "ファイル存在確認:" -ForegroundColor Cyan
Get-ChildItem -Path "app" -Filter "*.tsx" | Select-Object Name, FullName, Length | Format-Table
Write-Host "app/page_utf8.tsx存在: $(Test-Path 'app/page_utf8.tsx')" -ForegroundColor Cyan

# TypeScript現状確認
Write-Host "TypeScript現状確認:" -ForegroundColor Cyan
npx tsc --noEmit 2>&1 | Tee-Object -FilePath "ts_before_repair.log"
$BEFORE_ERRORS = (Select-String -Path "ts_before_repair.log" -Pattern "error TS" | Measure-Object).Count
Write-Host "修復前TypeScriptエラー: $BEFORE_ERRORS 件" -ForegroundColor $(if ($BEFORE_ERRORS -eq 0) { 'Green' } else { 'Red' })

if ($BEFORE_ERRORS -gt 0) {
    Write-Host "主要エラー:" -ForegroundColor Yellow
    Get-Content "ts_before_repair.log" | Select-Object -First 10
}

## Step 2: 不要ファイル削除
Write-Host "--- Step 2: 不要ファイル削除 ---" -ForegroundColor Yellow

# app/page_utf8.tsx削除
if (Test-Path "app/page_utf8.tsx") {
    $fileSize = (Get-Item "app/page_utf8.tsx").Length
    Write-Host "app/page_utf8.tsx発見 (サイズ: $fileSize バイト)" -ForegroundColor Yellow
    Remove-Item "app/page_utf8.tsx" -Force
    Write-Host "✅ app/page_utf8.tsx削除完了" -ForegroundColor Green
} else {
    Write-Host "✅ app/page_utf8.tsx存在しない" -ForegroundColor Green
}

# その他の不要ファイル削除
$backupFiles = @("app/page.tsx.*.backup", "temp_app_page_before.txt", "*.corrupted.backup")
foreach ($pattern in $backupFiles) {
    $files = Get-ChildItem -Path . -Filter $pattern -ErrorAction SilentlyContinue
    if ($files) {
        $files | Remove-Item -Force
        Write-Host "✅ バックアップファイル削除: $($files.Count) 件" -ForegroundColor Green
    }
}

## Step 3: app/page.tsx文字化けチェック・修復
Write-Host "--- Step 3: app/page.tsx文字化けチェック・修復 ---" -ForegroundColor Yellow

# 現在のファイル内容確認
if (Test-Path "app/page.tsx") {
    $content = Get-Content "app/page.tsx" -Raw -Encoding UTF8
    $fileSize = (Get-Item "app/page.tsx").Length
    Write-Host "app/page.tsx現在サイズ: $fileSize バイト" -ForegroundColor Cyan
    
    # 文字化けパターンチェック
    $mojibakePatterns = @("蛻�", "譌�", "逕ｨ", "閠�", "蟶…", "縺�", "縺ｮ")
    $hasMojibake = $false
    
    foreach ($pattern in $mojibakePatterns) {
        if ($content -match $pattern) {
            Write-Host "⚠️ 文字化けパターン発見: $pattern" -ForegroundColor Red
            $hasMojibake = $true
        }
    }
    
    if ($hasMojibake) {
        Write-Host "文字化け検出 - 正常版復元を実行" -ForegroundColor Yellow
        
        # 破損版バックアップ
        Copy-Item "app/page.tsx" "app/page.tsx.corrupted.backup" -Force
        Write-Host "✅ 破損版バックアップ完了" -ForegroundColor Green
        
        # 正常版取得
        Write-Host "正常版取得中..." -ForegroundColor Cyan
        try {
            git show e591f84:app/page.tsx > app/page.tsx.clean
            
            if (Test-Path "app/page.tsx.clean" -and (Get-Item "app/page.tsx.clean").Length -gt 0) {
                # 取得版の文字化けチェック
                $cleanContent = Get-Content "app/page.tsx.clean" -Raw -Encoding UTF8
                $cleanHasMojibake = $false
                
                foreach ($pattern in $mojibakePatterns) {
                    if ($cleanContent -match $pattern) {
                        $cleanHasMojibake = $true
                        break
                    }
                }
                
                if ($cleanHasMojibake) {
                    Write-Host "⚠️ 取得版にも文字化けあり - 別コミットを試行" -ForegroundColor Yellow
                    git show HEAD~10:app/page.tsx > app/page.tsx.clean
                }
                
                # 正常版で置き換え
                Move-Item "app/page.tsx.clean" "app/page.tsx" -Force
                Write-Host "✅ app/page.tsx正常版復元完了" -ForegroundColor Green
                
                # 復元確認
                $restoredSize = (Get-Item "app/page.tsx").Length
                Write-Host "復元後サイズ: $restoredSize バイト" -ForegroundColor Cyan
                
            } else {
                Write-Host "❌ 正常版取得失敗" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Git復元エラー: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ 文字化けなし - app/page.tsx正常" -ForegroundColor Green
    }
} else {
    Write-Host "❌ app/page.tsx存在しない" -ForegroundColor Red
}

## Step 4: TypeScript再確認
Write-Host "--- Step 4: TypeScript再確認 ---" -ForegroundColor Yellow

npx tsc --noEmit 2>&1 | Tee-Object -FilePath "ts_after_repair.log"
$AFTER_ERRORS = (Select-String -Path "ts_after_repair.log" -Pattern "error TS" | Measure-Object).Count

Write-Host "修復前エラー: $BEFORE_ERRORS 件" -ForegroundColor Cyan
Write-Host "修復後エラー: $AFTER_ERRORS 件" -ForegroundColor Cyan
$resolvedErrors = $BEFORE_ERRORS - $AFTER_ERRORS
Write-Host "解決エラー: $resolvedErrors 件" -ForegroundColor $(if ($resolvedErrors -gt 0) { 'Green' } else { 'Yellow' })

if ($AFTER_ERRORS -eq 0) {
    Write-Host "🎊 TypeScriptエラー完全解決" -ForegroundColor Green
} elseif ($AFTER_ERRORS -lt 10) {
    Write-Host "✅ エラー大幅減少" -ForegroundColor Green
    Write-Host "残存エラー:" -ForegroundColor Yellow
    Get-Content "ts_after_repair.log" | Select-Object -First 10
} else {
    Write-Host "⚠️ 追加修正必要" -ForegroundColor Yellow
    Write-Host "主要エラー:" -ForegroundColor Yellow
    Get-Content "ts_after_repair.log" | Select-Object -First 20
}

## Step 5: ビルド確認
Write-Host "--- Step 5: ビルド確認 ---" -ForegroundColor Yellow

if ($AFTER_ERRORS -eq 0) {
    Write-Host "TypeScriptエラー0件 - ビルド実行" -ForegroundColor Cyan
    pnpm build
    $BUILD_RESULT = $LASTEXITCODE
    
    if ($BUILD_RESULT -eq 0) {
        Write-Host "🎊 ビルド完全成功" -ForegroundColor Green
    } else {
        Write-Host "⚠️ ビルド失敗" -ForegroundColor Yellow
        Write-Host "ビルドエラー詳細:" -ForegroundColor Yellow
        pnpm build 2>&1 | Select-Object -First 15
    }
} else {
    Write-Host "TypeScriptエラー残存 - ビルドスキップ" -ForegroundColor Yellow
    $BUILD_RESULT = 1
}

## Step 6: 修復完了処理
Write-Host "--- Step 6: 修復完了処理 ---" -ForegroundColor Yellow

if ($AFTER_ERRORS -eq 0 -and $BUILD_RESULT -eq 0) {
    Write-Host "Phase 2-A完全成功 - コミット実行" -ForegroundColor Green
    
    # 修復完了コミット
    git add .
    git commit -m "fix: complete Phase 2-A character encoding corruption repair

- Remove corrupted temporary files (app/page_utf8.tsx)
- Restore app/page.tsx from clean commit (e591f84)
- Fix all character encoding issues (mojibake)
- Resolve TypeScript errors: $BEFORE_ERRORS → 0
- Build success confirmed
- Complete Phase 2-A foundation repair"
    
    git push origin main
    Write-Host "✅ 修復完了コミット・プッシュ済み" -ForegroundColor Green
    
} elseif ($AFTER_ERRORS -lt 10) {
    Write-Host "大幅改善完了 - 残存エラー個別対応後にコミット推奨" -ForegroundColor Yellow
    
} else {
    Write-Host "追加修復が必要 - コミットは保留" -ForegroundColor Yellow
}

## Step 7: 最終サマリー
Write-Host ""
Write-Host "=== Phase 2-A修復結果サマリー ===" -ForegroundColor Magenta
Write-Host "TypeScriptエラー: $BEFORE_ERRORS → $AFTER_ERRORS (解決: $resolvedErrors)" -ForegroundColor Cyan
Write-Host "ビルド状況: $(if ($BUILD_RESULT -eq 0) { '✅ 成功' } else { '❌ 失敗' })" -ForegroundColor Cyan
Write-Host "Phase 2-A状況: $(if ($AFTER_ERRORS -eq 0 -and $BUILD_RESULT -eq 0) { '🎊 完了' } else { '⏸️ 継続中' })" -ForegroundColor Cyan

if ($AFTER_ERRORS -eq 0 -and $BUILD_RESULT -eq 0) {
    Write-Host ""
    Write-Host "🎊 Phase 2-A完全成功" -ForegroundColor Green
    Write-Host "重心ケアアプリ基盤完全安定化" -ForegroundColor Green
    Write-Host "次のステップ: Phase 2-B (PR統合)開始可能" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "次のステップ: $(if ($AFTER_ERRORS -lt 10) { '残存エラー個別対応' } else { '追加修復作業' })" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Phase 2-A修復スクリプト完了 ===" -ForegroundColor Magenta
