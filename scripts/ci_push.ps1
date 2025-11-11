$ErrorActionPreference = "Stop"

# 現在のブランチを取得
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $branch"

# 空コミットを作成してプッシュ
try {
  git commit --allow-empty -m "chore(ci): trigger workflows"
  git push origin $branch
  Write-Host "Pushed empty commit to origin/$branch"
} catch {
  Write-Host "Push failed: $_" -ForegroundColor Red
  exit 1
}

# 最新コミットID
$lastCommit = git rev-parse HEAD
Write-Host "Last commit: $lastCommit"

# GitHubスラッグ (owner/repo) を自動抽出
$originUrl = git remote get-url origin
$slug = $originUrl -replace '.*github\.com[:/](.*?)(\.git)?$','$1'
$base = "https://github.com/$slug/actions/workflows"

# ワークフローURLを表示
Write-Host "`nOpen GitHub Actions workflows:"
Write-Host "  - openai-smoketest:  $base/openai-smoketest.yml"
Write-Host "  - snyk:               $base/snyk.yml"
Write-Host "  - sonar:              $base/sonar.yml"
Write-Host "  - coverage:           $base/coverage.yml"
Write-Host "  - ai-review:          $base/ai-review.yml"
