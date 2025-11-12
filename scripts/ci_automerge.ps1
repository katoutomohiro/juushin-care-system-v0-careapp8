# ci_automerge.ps1
# PowerShell 5.1 Compatible CI Auto-Merge Script
# Purpose: Monitor PR status and auto-merge when all required checks pass

param(
    [int]$Pr = 143,
    [string]$HeadBranch = "ci/add-workflows",
    [string]$BaseBranch = "main",
    [int]$TimeoutMinutes = 90,
    [int]$PollSecMin = 20,
    [int]$PollSecMax = 90
)

$ErrorActionPreference = "Stop"
Import-Module "$PSScriptRoot\modules\CiUtils.psm1" -Force

# 変数の役割を厳密に分離
$prNumber = $Pr
$slug     = Get-RepoSlug
$owner    = $slug.Owner
$repo     = $slug.Repo

# PR 情報の取得（オブジェクトは prInfo に入れる）
$prInfo   = Get-PrInfo -Number $prNumber
$sha      = $prInfo.headRefOid
$base     = $BaseBranch

# Get required contexts from branch protection
$required = Get-RequiredContexts -Owner $owner -Repo $repo -Branch $base

# ★ Early validation: Check if required contexts match actual check names
Write-Host ""
Write-Host "=== Validating Required Contexts ===" -ForegroundColor Cyan
$ok = Test-RequiredContextsAttached -Owner $owner -Repo $repo -Branch $base -Sha $sha -RequiredContexts $required
if (-not $ok) {
    Write-Host ""
    Write-Host "  [EXIT] Required contexts mismatch detected." -ForegroundColor Red
    Write-Host "  Action: Update branch protection contexts with the command above, then rerun this script." -ForegroundColor Yellow
    Write-Host ""
    exit 2
}
Write-Host "  [OK] All required contexts are attached to this commit" -ForegroundColor Green
Write-Host ""

# Script state
$script:startTime = Get-Date
$script:iteration = 0
$script:rerunCount = 0
$script:emptyCommitCount = 0
$script:mergeAttempts = 0
$script:lastMergeResult = "Not attempted"

function Get-Elapsed {
    $elapsed = (Get-Date) - $script:startTime
    return "{0}m {1}s" -f [int]$elapsed.TotalMinutes, $elapsed.Seconds
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host ("--- {0} ---" -f $Title) -ForegroundColor Cyan
}

function Write-Report {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Pr,
        
        [Parameter(Mandatory = $true)]
        [array]$Checks,
        
        [Parameter(Mandatory = $true)]
        [string]$Status,
        
        [Parameter(Mandatory = $false)]
        [array]$RequiredNames = @()
    )
    
    $reportPath = Join-Path $PSScriptRoot "ci_report.md"
    
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# CI Auto-Merge Report")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("**PR:** #$($Pr.number) - $($Pr.title)")
    [void]$sb.AppendLine("**Branch:** $($Pr.headRefName) -> $($Pr.baseRefName)")
    [void]$sb.AppendLine("**Status:** $Status")
    [void]$sb.AppendLine("**Elapsed:** $(Get-Elapsed)")
    [void]$sb.AppendLine("**Iterations:** $script:iteration")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Statistics")
    [void]$sb.AppendLine("- Rerun count: $script:rerunCount")
    [void]$sb.AppendLine("- Empty commits: $script:emptyCommitCount")
    [void]$sb.AppendLine("- Merge attempts: $script:mergeAttempts")
    [void]$sb.AppendLine("- Last merge result: $script:lastMergeResult")
    [void]$sb.AppendLine("")
    
    if ($RequiredNames.Count -gt 0) {
        [void]$sb.AppendLine("## Required Checks (Blockers)")
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine("| Name | Status | Conclusion |")
        [void]$sb.AppendLine("|------|--------|------------|")
        
        foreach ($name in $RequiredNames) {
            $check = $Checks | Where-Object { $_.Name -eq $name } | Select-Object -First 1
            if ($check) {
                [void]$sb.AppendLine("| $($check.Name) | $($check.Status) | $($check.Conclusion) |")
            }
            else {
                [void]$sb.AppendLine("| $name | NOT_FOUND | NONE |")
            }
        }
        [void]$sb.AppendLine("")
    }
    
    [void]$sb.AppendLine("## All Checks")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| Name | Status | Conclusion | URL |")
    [void]$sb.AppendLine("|------|--------|------------|-----|")
    
    foreach ($check in $Checks) {
        $url = if (-not [string]::IsNullOrEmpty($check.Url)) { $check.Url } else { "-" }
        [void]$sb.AppendLine("| $($check.Name) | $($check.Status) | $($check.Conclusion) | $url |")
    }
    
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    
    $content = $sb.ToString()
    [System.IO.File]::WriteAllText($reportPath, $content, [System.Text.Encoding]::UTF8)
    
    Write-Host "  Report written: $reportPath" -ForegroundColor DarkGray
}

try {
    Write-Host ""
    Write-Host "========================================"  -ForegroundColor White
    Write-Host " CI Auto-Merge Operator" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor White
    Write-Host ""
    Write-Host "# Target: PR #$prNumber ($HeadBranch -> $BaseBranch)" -ForegroundColor White
    Write-Host "# Timeout: $TimeoutMinutes minutes" -ForegroundColor White
    Write-Host "# Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    
    # Pre-flight checks
    Write-Section "Pre-flight Checks"
    
    gh auth status 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI not authenticated"
    }
    Write-Host "  [OK] GitHub CLI authenticated" -ForegroundColor Green
    
    $slug = Get-RepoSlug
    $owner = $slug.Owner
    $repo = $slug.Repo
    Write-Host "  [OK] Repository: $owner/$repo" -ForegroundColor Green
    
    # Get required status checks
    Write-Section "Required Status Checks"
    $requiredContexts = Get-RequiredContexts -Owner $owner -Repo $repo -Branch $BaseBranch
    Write-Host "  Required checks: $($requiredContexts -join ', ')" -ForegroundColor Cyan
    
    # Main loop
    Write-Section "Monitoring Loop"
    
    $pollSec = $PollSecMin
    $merged = $false
    $prData = $null  # Initialize for error handler scope
    
    while (-not $merged) {
        $script:iteration++
        $elapsed = (Get-Date) - $script:startTime
        
        if ($elapsed.TotalMinutes -ge $TimeoutMinutes) {
            throw "Timeout after $TimeoutMinutes minutes"
        }
        
        Write-Host ""
        Write-Host "[Iteration $script:iteration | Elapsed: $(Get-Elapsed)]" -ForegroundColor Magenta
        
        # Get PR info
        try {
            $prData = Get-PrInfo -Number $Pr
        }
        catch {
            Write-Host "  [ERROR] Could not get PR info: $_" -ForegroundColor Red
            Start-Sleep -Seconds $pollSec
            continue
        }
        
        if ($prData.state -ne 'OPEN') {
            Write-Host "  [INFO] PR is $($prData.state), stopping" -ForegroundColor Yellow
            break
        }
        
        if ($prData.isDraft) {
            Write-Host "  [INFO] PR is draft, waiting..." -ForegroundColor Yellow
            Start-Sleep -Seconds $pollSec
            continue
        }
        
        # Check if required checks exist in actual contexts
        $actualContexts = Get-ActualContexts -Owner $owner -Repo $repo -Sha $prData.headRefOid
        $missingContexts = @()
        
        foreach ($required in $requiredContexts) {
            if ($required -notin $actualContexts) {
                $missingContexts += $required
            }
        }
        
        if ($missingContexts.Count -gt 0) {
            Write-Host ""
            Write-Host "  [ERROR] Required checks are NOT attached to this commit!" -ForegroundColor Red
            Write-Host ("  Missing: {0}" -f ($missingContexts -join ', ')) -ForegroundColor Red
            Write-Host ""
            Write-Host "  Actual contexts found:" -ForegroundColor Yellow
            foreach ($ctx in $actualContexts) { Write-Host ("    - {0}" -f $ctx) -ForegroundColor DarkYellow }
            Write-Host ""
            Write-Host "  Fix: Update branch protection contexts to match actual names." -ForegroundColor Cyan
            
            # --- begin: show fix command safely (no -f inside strings) ---
            $cmdLines = @("gh api -X PUT repos/$owner/$repo/branches/$BaseBranch/protection/required_status_checks/contexts")
            foreach ($ctx in $actualContexts) {
                # 値にスペースがあるので -f の引数全体をクォートして渡す
                $cmdLines += "  -f 'contexts[]=$ctx'"
            }
            $cmd = [string]::Join([Environment]::NewLine, $cmdLines)
            
            Write-Host ""
            Write-Host $cmd -ForegroundColor White
            Write-Host ""
            # --- end: show fix command safely ---
            
            # Write report and exit with code 2
            Write-Report -Pr $prData -Checks $prData.NormalizedChecks -Status "ERROR: Missing required checks" -RequiredNames $requiredContexts
            exit 2
        }
        
        # Classify checks
        $checks = $prData.NormalizedChecks
        $success = @($checks | Where-Object { $_.Conclusion -eq 'SUCCESS' })
        $pending = @($checks | Where-Object { $_.Status -eq 'PENDING' -or $_.Status -eq 'QUEUED' -or $_.Status -eq 'IN_PROGRESS' })
        $failure = @($checks | Where-Object { $_.Conclusion -eq 'FAILURE' -or $_.Conclusion -eq 'CANCELLED' })
        $unknown = @($checks | Where-Object { $_.Status -eq 'UNKNOWN' -and $_.Conclusion -eq 'NONE' })
        
        Write-Host "  Checks: Success=$($success.Count) Pending=$($pending.Count) Failed=$($failure.Count) Unknown=$($unknown.Count) Total=$($checks.Count)" -ForegroundColor Cyan
        
        # Write report
        Write-Report -Pr $prData -Checks $checks -Status "Monitoring" -RequiredNames $requiredContexts
        
        # Test if all required checks are green
        $allGreen = Test-AllRequiredChecksGreen -Checks $checks -RequiredNames $requiredContexts
        
        if ($allGreen) {
            Write-Host ""
            Write-Host "  [SUCCESS] All required checks passed!" -ForegroundColor Green
            Write-Host "  Attempting merge..." -ForegroundColor Cyan
            
            $script:mergeAttempts++
            gh pr merge $prNumber --squash --auto 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [SUCCESS] PR #$prNumber merged!" -ForegroundColor Green
                $merged = $true
                $script:lastMergeResult = "SUCCESS"
                Write-Report -Pr $prData -Checks $checks -Status "MERGED" -RequiredNames $requiredContexts
                break
            }
            else {
                Write-Host "  [WARNING] Merge command failed (may be queued), retrying in 60s..." -ForegroundColor Yellow
                $script:lastMergeResult = "FAILED - retrying"
                Start-Sleep -Seconds 60
                continue
            }
        }
        
        # Classify required vs optional failures
        $requiredFailures = @()
        $requiredUnknowns = @()
        $optionalFailures = @()
        
        foreach ($fail in $failure) {
            if ($fail.Name -in $requiredContexts) {
                $requiredFailures += $fail
            }
            else {
                $optionalFailures += $fail
            }
        }
        
        foreach ($unk in $unknown) {
            if ($unk.Name -in $requiredContexts) {
                $requiredUnknowns += $unk
            }
        }
        
        # Show failures
        if ($requiredFailures.Count -gt 0) {
            Write-Host ""
            Write-Host "  [REQUIRED FAILURES - BLOCKING]" -ForegroundColor Red
            foreach ($fail in $requiredFailures) {
                Write-Host "    - $($fail.Name)" -ForegroundColor Red
            }
        }
        
        if ($requiredUnknowns.Count -gt 0) {
            Write-Host ""
            Write-Host "  [REQUIRED CHECKS NOT YET REPORTED - BLOCKING]" -ForegroundColor Red
            foreach ($unk in $requiredUnknowns) {
                Write-Host "    - $($unk.Name) (UNKNOWN/NONE - check not attached yet)" -ForegroundColor Red
            }
        }
        
        if ($optionalFailures.Count -gt 0) {
            Write-Host ""
            Write-Host "  [OPTIONAL FAILURES - NOT BLOCKING]" -ForegroundColor Yellow
            foreach ($fail in $optionalFailures) {
                Write-Host "    - $($fail.Name)" -ForegroundColor DarkYellow
            }
        }
        
        # Handle required failures/unknowns with retrigger logic
        $needsRetrigger = ($requiredFailures.Count -gt 0) -or ($requiredUnknowns.Count -gt 0) -or ($pending.Count -gt 0)
        
        if ($needsRetrigger) {
            Write-Host ""
            Write-Host "  Attempting to retrigger checks..." -ForegroundColor Yellow
            
            # For UNKNOWN/NONE checks or App checks: prefer empty commit
            $hasUnknownOrApp = $requiredUnknowns.Count -gt 0
            
            if (-not $hasUnknownOrApp) {
                # Try rerunning GitHub Actions first
                try {
                    $runs = List-ActionRunsForPr -HeadBranch $prData.headRefName
                    
                    foreach ($run in $runs) {
                        if ($run.conclusion -eq 'failure' -or $run.conclusion -eq 'cancelled') {
                            Write-Host "    Rerunning: $($run.workflowName) (Run #$($run.databaseId))..." -ForegroundColor Yellow
                            $success = Rerun-ActionRun -RunId $run.databaseId
                            
                            if ($success) {
                                Write-Host "      [OK] Rerun triggered" -ForegroundColor Green
                                $script:rerunCount++
                            }
                            else {
                                Write-Host "      [SKIP] Could not rerun" -ForegroundColor DarkYellow
                            }
                            
                            Start-Sleep -Seconds 2
                        }
                    }
                }
                catch {
                    Write-Host "    [WARNING] Could not rerun Actions: $_" -ForegroundColor Yellow
                }
            }
            
            # Always try empty commit for UNKNOWN/NONE or App checks (Vercel/CodeRabbit)
            Write-Host ""
            Write-Host "  [FALLBACK] Pushing empty commit to $HeadBranch to retrigger all checks..." -ForegroundColor Yellow
            $emptySuccess = Push-EmptyCommit -TargetBranch $HeadBranch -Message "ci: retrigger checks [iteration $script:iteration]"
            
            if ($emptySuccess) {
                $script:emptyCommitCount++
                Write-Host "  [OK] Empty commit pushed, waiting 30s for checks to start..." -ForegroundColor Green
                Start-Sleep -Seconds 30
            }
            else {
                Write-Host "  [ERROR] Empty commit failed" -ForegroundColor Red
            }
        }
        
        # Exponential backoff
        $pollSec = [Math]::Min($pollSec * 1.5, $PollSecMax)
        Write-Host ""
        Write-Host "  Waiting $([int]$pollSec) seconds before next check..." -ForegroundColor DarkGray
        Start-Sleep -Seconds $pollSec
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor White
    Write-Host " Script completed successfully" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor White
    Write-Host "# Elapsed: $(Get-Elapsed)" -ForegroundColor White
    Write-Host "# Iterations: $script:iteration" -ForegroundColor White
    Write-Host "# Reruns: $script:rerunCount" -ForegroundColor White
    Write-Host "# Empty commits: $script:emptyCommitCount" -ForegroundColor White
    Write-Host "# Merge attempts: $script:mergeAttempts" -ForegroundColor White
    exit 0
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host " ERROR" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "# $_" -ForegroundColor Red
    Write-Host "# Elapsed: $(Get-Elapsed)" -ForegroundColor White
    Write-Host "# Iterations: $script:iteration" -ForegroundColor White
    
    # Try to write error report
    try {
        if ($prData) {
            Write-Report -Pr $prData -Checks $prData.NormalizedChecks -Status "ERROR: $_" -RequiredNames @()
        }
    }
    catch {
        Write-Host "# Could not write final report" -ForegroundColor DarkRed
    }
    
    exit 1
}
