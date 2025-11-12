#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ブランチ保護の required contexts と実チェック名の整合性を検証

.DESCRIPTION
    main ブランチの required status checks と実際の check-runs 名が一致しているか確認し、
    不一致があれば修正コマンドを提示します。

.PARAMETER PrNumber
    チェック対象の PR 番号（任意、指定しない場合は最新のオープンPRを使用）

.PARAMETER AutoFix
    不一致を自動修正（デフォルト: false）

.EXAMPLE
    .\scripts\validate-branch-protection.ps1
    # 最新のPRで検証

.EXAMPLE
    .\scripts\validate-branch-protection.ps1 -PrNumber 149
    # PR #149 で検証

.EXAMPLE
    .\scripts\validate-branch-protection.ps1 -PrNumber 149 -AutoFix
    # 検証して不一致があれば自動修正

.NOTES
    前提条件:
    - GitHub CLI (gh) がインストール済み
    - リポジトリへの admin 権限（AutoFix 使用時）

.LINK
    https://docs.github.com/en/rest/branches/branch-protection
#>

param(
    [int]$PrNumber,
    [switch]$AutoFix
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# CiUtils モジュール読み込み
Import-Module "$PSScriptRoot/modules/CiUtils.psm1" -Force

# 色付き出力
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

Write-Host "`n=== Branch Protection Validation ===" -ForegroundColor Cyan

# PR番号の決定
if (-not $PrNumber) {
    Write-Info "No PR number specified, finding latest open PR..."
    $latestPr = gh pr list --state open --limit 1 --json number --jq '.[0].number'
    
    if (-not $latestPr) {
        Write-Failure "No open PRs found"
        exit 1
    }
    
    $PrNumber = [int]$latestPr
    Write-Info "Using PR #$PrNumber"
}

# 1. Required contexts 取得
Write-Info "Fetching required contexts from main branch protection..."
$requiredContexts = Get-RequiredContexts

if (-not $requiredContexts) {
    Write-Warning "No required status checks configured for main branch"
    exit 0
}

Write-Info "Required contexts ($($requiredContexts.Count)):"
$requiredContexts | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

# 2. 実チェック名取得
Write-Info "Fetching actual check names from PR #$PrNumber..."
$actualCheckNames = Get-ActualCheckNames -PrNumber $PrNumber

if (-not $actualCheckNames) {
    Write-Warning "No check runs found for PR #$PrNumber"
    exit 0
}

Write-Info "Actual check names ($($actualCheckNames.Count)):"
$actualCheckNames | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

# 3. 整合性チェック
Write-Info "Validating required contexts against actual check names..."

$isValid = Test-RequiredContextsAttached -PrNumber $PrNumber

if ($isValid) {
    Write-Success "All required contexts match actual check names"
    Write-Host "`nMatching checks:" -ForegroundColor Green
    
    foreach ($required in $requiredContexts) {
        if ($required -in $actualCheckNames) {
            Write-Host "  ✓ $required" -ForegroundColor Green
        }
    }
    
    exit 0
} else {
    Write-Failure "Required contexts mismatch detected"
    
    # 不一致の詳細表示
    Write-Host "`nMismatch details:" -ForegroundColor Yellow
    
    $missingInActual = $requiredContexts | Where-Object { $_ -notin $actualCheckNames }
    if ($missingInActual) {
        Write-Host "`nRequired but not found in actual checks:" -ForegroundColor Red
        $missingInActual | ForEach-Object { Write-Host "  ✗ $_" -ForegroundColor Red }
    }
    
    $candidates = $actualCheckNames | Where-Object { 
        $name = $_
        -not ($requiredContexts | Where-Object { $_ -eq $name })
    }
    if ($candidates) {
        Write-Host "`nPossible candidates from actual checks:" -ForegroundColor Cyan
        $candidates | ForEach-Object { Write-Host "  ? $_" -ForegroundColor Cyan }
    }
    
    # 修正コマンド生成
    Write-Host "`nSuggested fix:" -ForegroundColor Yellow
    
    $repoSlug = Get-RepoSlug
    $contextsArgs = $actualCheckNames | ForEach-Object { "contexts[]=$_" }
    $fixCommand = "gh api -X PUT repos/$repoSlug/branches/main/protection/required_status_checks/contexts " +
                  ($contextsArgs | ForEach-Object { "-f `"$_`"" } | Join-String -Separator ' ')
    
    Write-Host $fixCommand -ForegroundColor Yellow
    
    # 自動修正
    if ($AutoFix) {
        Write-Warning "Auto-fix is enabled, applying changes..."
        
        try {
            # required contextsを実チェック名で更新
            $apiArgs = @('api', '-X', 'PUT', "repos/$repoSlug/branches/main/protection/required_status_checks/contexts")
            foreach ($context in $actualCheckNames) {
                $apiArgs += @('-f', "contexts[]=$context")
            }
            
            & gh @apiArgs | Out-Null
            
            Write-Success "Required contexts updated successfully"
            
            # 更新後の状態確認
            $updatedContexts = Get-RequiredContexts
            Write-Info "Updated required contexts:"
            $updatedContexts | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
            
            exit 0
        } catch {
            Write-Failure "Failed to update required contexts: $_"
            exit 1
        }
    } else {
        Write-Info "Run with -AutoFix to apply changes automatically"
        exit 2
    }
}
