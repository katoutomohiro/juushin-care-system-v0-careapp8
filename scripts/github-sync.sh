#!/bin/bash

# GitHub同期スクリプト
echo "=== GitHub同期開始 ==="

# 現在のGit状況確認
echo "--- 現在のGit状況 ---"
git status
git remote -v

# 最新のリモートリポジトリから取得
echo "--- リモートから最新版を取得 ---"
git fetch origin

# ローカルの変更をコミット（必要に応じて）
echo "--- ローカル変更の確認 ---"
if [[ -n $(git status --porcelain) ]]; then
    echo "ローカルに未コミットの変更があります"
    git add .
    git commit -m "sync: local changes before GitHub sync"
fi

# リモートの最新版とマージ
echo "--- リモートとマージ ---"
git pull origin main

# プッシュ
echo "--- リモートにプッシュ ---"
git push origin main

echo "✅ GitHub同期完了"
