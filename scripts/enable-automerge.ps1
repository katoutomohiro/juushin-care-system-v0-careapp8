#!/usr/bin/env pwsh
<#
.SYNOPSIS
    PR に Auto-merge を有効化する運用補助スクリプト

.DESCRIPTION
    指定した PR に対して以下を実行:
    1. ux-ready ラベルを付与（ワークフロートリガー）
    2. GitHub 公式 Auto-merge を有効化（--auto --squash --delete-branch）
    3. 必須チェックの状態を確認

.PARAMETER Pr
    PR番号（必須）

.PARAMETER SkipLabel
    ux-ready ラベルの付与をスキップ（デフォルト: false）

.PARAMETER SkipAutoMerge
    GitHub Auto-merge の有効化をスキップ（デフォルト: false）

.EXAMPLE
    .\scripts\enable-automerge.ps1 -Pr 149
    # PR #149 に ux-ready ラベル付与 + Auto-merge 有効化

.EXAMPLE
    .\scripts\enable-automerge.ps1 -Pr 149 -SkipLabel
    # Auto-merge のみ有効化（ラベルは既存のものを使用）

.NOTES
    前提条件:
    - GitHub CLI (gh) がインストール済み
    - GH_TOKEN 環境変数または gh auth login でログイン済み
    - リポジトリで Auto-merge が許可されている

.LINK
    https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
#>

param(
    [Parameter(Mandatory = $true)]
    [int]$Pr,

    [switch]$SkipLabel,
    [switch]$SkipAutoMerge
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# 色付き出力ヘルパー
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

Write-Info "Starting auto-merge enablement for PR #$Pr"

# 1. PR 情報取得
Write-Info "Fetching PR information..."
$prInfo = gh pr view $Pr --json number,state,isDraft,labels,headRefName | ConvertFrom-Json

if ($prInfo.state -ne 'OPEN') {
    Write-Failure "PR #$Pr is not open (state: $($prInfo.state))"
    exit 1
}

if ($prInfo.isDraft) {
    Write-Warning "PR #$Pr is in draft state - auto-merge will wait until ready for review"
}

Write-Success "PR #$Pr is open (branch: $($prInfo.headRefName))"

# 2. ux-ready ラベル付与
if (-not $SkipLabel) {
    $hasUxReady = $prInfo.labels | Where-Object { $_.name -eq 'ux-ready' }
    
    if ($hasUxReady) {
        Write-Info "Label 'ux-ready' is already attached"
    } else {
        Write-Info "Adding 'ux-ready' label..."
        gh pr edit $Pr --add-label 'ux-ready'
        Write-Success "Label 'ux-ready' added"
    }
} else {
    Write-Info "Skipping label addition (--SkipLabel specified)"
}

# 3. no-auto-merge ラベルチェック（非常停止）
$hasNoAutoMerge = $prInfo.labels | Where-Object { $_.name -eq 'no-auto-merge' }
if ($hasNoAutoMerge) {
    Write-Failure "Emergency stop: 'no-auto-merge' label is attached"
    Write-Info "Remove the label to proceed: gh pr edit $Pr --remove-label 'no-auto-merge'"
    exit 1
}

# 4. GitHub Auto-merge 有効化
if (-not $SkipAutoMerge) {
    Write-Info "Enabling GitHub Auto-merge (squash + delete-branch)..."
    
    try {
        gh pr merge $Pr --auto --squash --delete-branch 2>&1 | Out-Null
        Write-Success "Auto-merge enabled (squash + delete-branch)"
    } catch {
        Write-Warning "Failed to enable auto-merge: $_"
        Write-Info "This may be expected if auto-merge is already enabled or not allowed"
    }
} else {
    Write-Info "Skipping auto-merge enablement (--SkipAutoMerge specified)"
}

# 5. 必須チェックの状態確認
Write-Info "Checking required status checks..."

$sha = gh pr view $Pr --json headRefOid --jq .headRefOid
$requiredContexts = gh api "repos/{owner}/{repo}/branches/main/protection/required_status_checks" --jq '.contexts[]' 2>$null

if ($requiredContexts) {
    Write-Info "Required checks: $($requiredContexts -join ', ')"
    
    $checkRuns = gh api "repos/{owner}/{repo}/commits/$sha/check-runs" --jq '.check_runs[] | select(.name == "SonarCloud Code Analysis" or .name == "Vercel Preview Comments")'
    
    if ($checkRuns) {
        $checkStatus = $checkRuns | ConvertFrom-Json | ForEach-Object {
            $status = if ($_.conclusion) { $_.conclusion } else { $_.status }
            "$($_.name): $status"
        }
        
        Write-Info "Current status:"
        $checkStatus | ForEach-Object { Write-Host "  - $_" }
    }
} else {
    Write-Warning "No required status checks found for main branch"
}

Write-Success "Auto-merge setup completed for PR #$Pr"
Write-Info "The PR will be automatically merged when all required checks pass"
