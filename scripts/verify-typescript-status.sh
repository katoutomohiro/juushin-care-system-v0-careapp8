#!/bin/bash

# 重心ケアアプリ TypeScript状況確認スクリプト

echo "=== 重心ケアアプリ TypeScript状況確認 ==="

# Step 1: ファイル存在確認
echo "--- Step 1: ファイル存在確認 ---"
echo "app/page.tsx存在: $(test -f app/page.tsx && echo 'YES' || echo 'NO')"
echo "app/page_utf8.tsx存在: $(test -f app/page_utf8.tsx && echo 'YES' || echo 'NO')"

# Step 2: TypeScript型チェック
echo "--- Step 2: TypeScript型チェック ---"
npx tsc --noEmit 2>&1 | tee ts_check.log
ERROR_COUNT=$(grep -c "error TS" ts_check.log || echo "0")
echo "TypeScriptエラー数: $ERROR_COUNT"

# Step 3: ビルド確認
echo "--- Step 3: ビルド確認 ---"
if [ $ERROR_COUNT -eq 0 ]; then
    echo "TypeScriptエラー0件 - ビルド実行"
    pnpm build
    BUILD_RESULT=$?
    echo "ビルド結果: $([ $BUILD_RESULT -eq 0 ] && echo 'SUCCESS' || echo 'FAILED')"
else
    echo "TypeScriptエラー残存 - ビルドスキップ"
fi

# Step 4: 結果サマリー
echo "--- Step 4: 結果サマリー ---"
echo "TypeScriptエラー: $ERROR_COUNT 件"
echo "ビルド: $([ ${BUILD_RESULT:-1} -eq 0 ] && echo '✅ 成功' || echo '❌ 失敗')"

if [ $ERROR_COUNT -eq 0 ] && [ ${BUILD_RESULT:-1} -eq 0 ]; then
    echo "🎊 Phase 2-A完全成功"
    echo "重心ケアアプリ基盤完全安定化"
else
    echo "⚠️ 追加対応が必要"
fi
