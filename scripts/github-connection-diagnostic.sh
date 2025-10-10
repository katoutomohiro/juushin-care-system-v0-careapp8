#!/bin/bash

echo "=== GitHub接続診断スクリプト ==="

echo "Goal: Diagnose why 'GitHub の読み込みに失敗しました' と表示され、GitHub と同期できない"
echo ""

# Step 1: Verify current Git remotes
echo "--- Step 1: Git remotes確認 ---"
echo "Running: git remote -v"
git remote -v
echo ""

# Step 2: Check repository status
echo "--- Step 2: リポジトリ状況確認 ---"
echo "Running: git status"
git status
echo ""

# Step 3: Test network/auth connectivity using GitHub CLI
echo "--- Step 3: GitHub CLI認証確認 ---"
echo "Running: gh auth status"
if command -v gh &> /dev/null; then
    gh auth status 2>&1
    if [ $? -ne 0 ]; then
        echo "Not logged in. Please run: gh auth login"
    else
        echo "Running: gh repo view katoutomohiro/v0-git-hub-project-soul-care-system --web"
        gh repo view katoutomohiro/v0-git-hub-project-soul-care-system --web 2>&1
    fi
else
    echo "GitHub CLI not installed"
fi
echo ""

# Step 4: Fetch from origin to confirm credentials
echo "--- Step 4: Origin fetch確認 ---"
echo "Running: git fetch origin"
git fetch origin 2>&1
FETCH_RESULT=$?
if [ $FETCH_RESULT -eq 0 ]; then
    echo "✅ Fetch succeeded"
else
    echo "❌ Fetch failed with exit code: $FETCH_RESULT"
fi
echo ""

# Step 5: Test push (dry-run)
echo "--- Step 5: Push dry-run テスト ---"
echo "Running: git push --dry-run origin main"
git push --dry-run origin main 2>&1
PUSH_RESULT=$?
if [ $PUSH_RESULT -eq 0 ]; then
    echo "✅ Push dry-run succeeded"
else
    echo "❌ Push dry-run failed with exit code: $PUSH_RESULT"
fi
echo ""

# Step 6: Summarize findings
echo "--- Step 6: 診断結果まとめ ---"
echo "Remote URLs:"
git remote -v
echo ""
echo "Auth status: $(if command -v gh &> /dev/null; then gh auth status 2>&1 | head -1; else echo 'GitHub CLI not available'; fi)"
echo "Fetch result: $(if [ $FETCH_RESULT -eq 0 ]; then echo 'SUCCESS'; else echo 'FAILED'; fi)"
echo "Push dry-run result: $(if [ $PUSH_RESULT -eq 0 ]; then echo 'SUCCESS'; else echo 'FAILED'; fi)"
echo ""

if [ $FETCH_RESULT -ne 0 ] || [ $PUSH_RESULT -ne 0 ]; then
    echo "推奨対応:"
    echo "- 認証の再設定: gh auth login"
    echo "- リモートURL再設定: git remote set-url origin https://github.com/katoutomohiro/v0-git-hub-project-soul-care-system.git"
    echo "- SSH鍵の確認: ssh -T git@github.com"
fi

echo "診断完了"
