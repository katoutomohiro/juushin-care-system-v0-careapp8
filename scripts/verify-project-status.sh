#!/bin/bash

echo "=== 重心ケアアプリ プロジェクト状況確認 ==="

# ファイル存在確認
echo "--- ファイル存在確認 ---"
ls -la app/page*.tsx 2>/dev/null || echo "No page files found"

# TypeScript確認
echo "--- TypeScript確認 ---"
if command -v npx &> /dev/null; then
    npx tsc --noEmit 2>&1 | tee ts_check.log
    ERROR_COUNT=$(grep -c "error TS" ts_check.log 2>/dev/null || echo "0")
    echo "TypeScriptエラー数: $ERROR_COUNT"
else
    echo "TypeScript not available"
fi

# ビルド確認
echo "--- ビルド確認 ---"
if command -v pnpm &> /dev/null; then
    pnpm build 2>&1 | tee build_check.log
    BUILD_RESULT=$?
    echo "ビルド結果: $([ $BUILD_RESULT -eq 0 ] && echo 'SUCCESS' || echo 'FAILED')"
else
    echo "pnpm not available"
fi

# 文字化けチェック
echo "--- 文字化けチェック ---"
if [ -f "app/page.tsx" ]; then
    if grep -q "蛻\|譌" app/page.tsx; then
        echo "❌ 文字化け検出"
        grep -n "蛻\|譌" app/page.tsx | head -5
    else
        echo "✅ 文字化けなし"
    fi
else
    echo "app/page.tsx not found"
fi

echo "=== 確認完了 ==="
