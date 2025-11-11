# scripts/ci_all.ps1
[CmdletBinding()]
param(
  [string]$Branch = $(git rev-parse --abbrev-ref HEAD)
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Get-RepoSlug {
  $url = git remote get-url origin
  if ($url -match 'github\.com[:/](.+?)/(.+?)(?:\.git)?$') { return "$($Matches[1])/$($Matches[2])" }
  throw "origin URL not recognized: $url"
}

$slug = Get-RepoSlug
Write-Host "[1/5] Repo: $slug  Branch: $Branch" -ForegroundColor Cyan

# 診断
& "$PSScriptRoot\diagnose.ps1" | Write-Host

# 空コミット & Push（文字列内の & は安全）
Write-Host "[2/5] Empty commit & push..." -ForegroundColor Yellow
& "$PSScriptRoot\ci_push.ps1"

# gh 認証確認（失敗時は例外）
gh auth status | Out-Null

# 起動するワークフロー
$workflows = @(
  "openai-smoketest.yml",
  "snyk.yml",
  "sonar.yml",
  "coverage.yml",
  "ai-review.yml"
)

$results = @()

foreach ($wf in $workflows) {
  Write-Host "[3/5] Trigger $wf on $Branch" -ForegroundColor Yellow
  gh workflow run $wf --ref $Branch | Out-Null

  Start-Sleep -Seconds 3

  $run = gh run list --workflow $wf --branch $Branch -L 1 --json databaseId,status,conclusion,url,name | ConvertFrom-Json | Select-Object -First 1
  if ($run -and $run.databaseId) {
    gh run watch $run.databaseId --exit-status | Out-Null
    $run = gh run view $run.databaseId --json name,status,conclusion,url | ConvertFrom-Json
  } else {
    $run = [pscustomobject]@{ name=$wf; status="queued"; conclusion="n/a"; url="" }
  }
  $results += $run
}

# レポート（ここ文字列で表を安全に作成）
$rows = ($results | ForEach-Object { "| $($_.name) | $($_.status) / $($_.conclusion) | $($_.url) |" }) -join "`r`n"
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$md = @"
# CI report for $slug ($Branch)
$timestamp

| Workflow | Result | URL |
|---|---|---|
$rows
"@

# UTF-8(BOM) で保存（WinPS5.1でも文字化け防止）
$reportPath = Join-Path $PSScriptRoot "..\ci-report.md"
$utf8bom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($reportPath, $md, $utf8bom)
Write-Host "[5/5] Wrote $reportPath" -ForegroundColor Green

