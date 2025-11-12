# CiUtils.psm1  --- minimal & robust (PowerShell 5.1)

function Get-RepoSlug {
    $remoteUrl = (git remote get-url origin 2>$null)
    if ([string]::IsNullOrEmpty($remoteUrl)) { throw "Could not get git remote URL" }
    if ($remoteUrl -match 'github\.com[:/]([^/]+)/([^/.]+)') {
        return @{ Owner = $matches[1]; Repo = $matches[2] }
    }
    throw "Could not parse owner/repo from remote URL: $remoteUrl"
}

function Get-PrInfo {
    param([Parameter(Mandatory=$true)][int]$Number)
    $prJson = gh pr view $Number --json number,title,headRefName,baseRefName,state,mergeable,statusCheckRollup,headRefOid,isDraft 2>$null | ConvertFrom-Json
    if ($null -eq $prJson) { throw "PR #$Number not found" }
    if ($null -eq $prJson.statusCheckRollup) { $prJson | Add-Member -NotePropertyName statusCheckRollup -NotePropertyValue @() -Force }
    
    # Normalize statusCheckRollup to NormalizedChecks
    $normalized = @()
    foreach ($item in $prJson.statusCheckRollup) {
        $check = @{
            Name = if ($item.name) { $item.name } elseif ($item.context) { $item.context } else { "UNKNOWN" }
            Status = if ($item.status) { $item.status } else { "UNKNOWN" }
            Conclusion = if ($item.conclusion) { $item.conclusion } else { "NONE" }
            Url = if ($item.detailsUrl) { $item.detailsUrl } elseif ($item.targetUrl) { $item.targetUrl } else { "" }
        }
        $normalized += [PSCustomObject]$check
    }
        # Build NormalizedChecks from Status API and Checks API for the PR HEAD SHA
        try {
            $slug = Get-RepoSlug
            $owner = $slug.Owner
            $repo  = $slug.Repo
            $sha   = $prJson.headRefOid

            $combined = @()

            # Prefer check-runs (more precise), then fill with status contexts
            try {
                $cr = gh api "repos/$owner/$repo/commits/$sha/check-runs" 2>$null | ConvertFrom-Json
                if ($cr -and $cr.check_runs) {
                    foreach ($r in $cr.check_runs) {
                        if (-not $r.name) { continue }
                        $status = if ($r.status) { ($r.status.ToString()).ToUpper() } else { 'UNKNOWN' }
                        $concl  = if ($r.conclusion) { ($r.conclusion.ToString()).ToUpper() } else { if ($status -eq 'COMPLETED') { 'NONE' } else { 'NONE' } }
                        $url    = if ($r.details_url) { $r.details_url } else { '' }
                        $combined += [pscustomobject]@{ Name = $r.name; Status = $status; Conclusion = $concl; Url = $url }
                    }
                }
            } catch {}

            try {
                $st = gh api "repos/$owner/$repo/commits/$sha/status" 2>$null | ConvertFrom-Json
                if ($st -and $st.statuses) {
                    foreach ($s in $st.statuses) {
                        if (-not $s.context) { continue }
                        $state = ($s.state.ToString()).ToLower()
                        $status = switch ($state) { 'pending' { 'PENDING' } default { 'COMPLETED' } }
                        $concl  = switch ($state) { 'success' { 'SUCCESS' } 'failure' { 'FAILURE' } 'error' { 'FAILURE' } 'pending' { 'NONE' } default { 'NONE' } }
                        $url    = if ($s.target_url) { $s.target_url } else { '' }
                        $combined += [pscustomobject]@{ Name = $s.context; Status = $status; Conclusion = $concl; Url = $url }
                    }
                }
            } catch {}

            # Dedupe by Name, preferring first occurrence (check-runs come first)
            $byName = @{}
            foreach ($c in $combined) { if (-not $byName.ContainsKey($c.Name)) { $byName[$c.Name] = $c } }
            $normalized = @()
            foreach ($k in $byName.Keys) { $normalized += $byName[$k] }

            $prJson | Add-Member -NotePropertyName NormalizedChecks -NotePropertyValue $normalized -Force
        } catch {
            # If anything fails, still return PR JSON without NormalizedChecks
        }
    
    return $prJson
}

function Get-RequiredContexts {
    param([string]$Owner,[string]$Repo,[string]$Branch)
    try {
        $r = gh api "repos/$Owner/$Repo/branches/$Branch/protection/required_status_checks" 2>$null | ConvertFrom-Json
        if ($r -and $r.contexts -and $r.contexts.Count -gt 0) { return $r.contexts }
        return @()
    } catch {
        Write-Host "  [WARNING] Could not get required contexts: $_" -ForegroundColor Yellow
        return @()
    }
}

function Get-ActualCheckNames {
    param([string]$Owner,[string]$Repo,[string]$Sha)
    $names = @()
    try {
        $runs = gh api "repos/$Owner/$Repo/commits/$Sha/check-runs" 2>$null | ConvertFrom-Json
        if ($runs -and $runs.check_runs) { foreach($run in $runs.check_runs){ if($run.name){ $names += $run.name } } }
    } catch {}
    return ($names | Select-Object -Unique)
}

function Get-ActualContexts {
    param([string]$Owner,[string]$Repo,[string]$Sha)
    $ctx = @()
    try {
        $st = gh api "repos/$Owner/$Repo/commits/$Sha/status" 2>$null | ConvertFrom-Json
        if ($st -and $st.statuses) { foreach($s in $st.statuses){ if($s.context){ $ctx += $s.context } } }
    } catch {}
    try {
        $cr = gh api "repos/$Owner/$Repo/commits/$Sha/check-runs" 2>$null | ConvertFrom-Json
        if ($cr -and $cr.check_runs) { foreach($c in $cr.check_runs){ if($c.name){ $ctx += $c.name } } }
    } catch {}
    return ($ctx | Select-Object -Unique)
}

function Test-RequiredContextsAttached {
    param([string]$Owner,[string]$Repo,[string]$Branch,[string]$Sha,[array]$RequiredContexts)
    if ($RequiredContexts.Count -eq 0) {
        Write-Host "  [INFO] No required contexts defined - any PR can merge" -ForegroundColor Cyan
        return $true
    }
    $actual = Get-ActualCheckNames -Owner $Owner -Repo $Repo -Sha $Sha
    $missing = @()
    foreach($req in $RequiredContexts){ if ($req -notin $actual){ $missing += $req } }
    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Host "  [ERROR] Required checks NOT attached to this commit!" -ForegroundColor Red
        Write-Host ("  Missing: {0}" -f ($missing -join ', ')) -ForegroundColor Red
        Write-Host ""
        Write-Host "  Actual check names (check-runs):" -ForegroundColor Yellow
        foreach($n in $actual){ Write-Host ("    - {0}" -f $n) -ForegroundColor DarkYellow }
        Write-Host ""
        Write-Host "  Fix: Update required contexts to these actual names:" -ForegroundColor Cyan
        $cmdLines = @("gh api -X PUT repos/$Owner/$Repo/branches/$Branch/protection/required_status_checks/contexts")
        foreach($n in $actual){ $cmdLines += "  -f contexts[]=$n" }
        $cmd = [string]::Join([Environment]::NewLine, $cmdLines)
        Write-Host $cmd -ForegroundColor White
        return $false
    }
    return $true
}

function Push-EmptyCommit {
    param([Parameter(Mandatory=$true)][string]$TargetBranch,[string]$Message = "ci: retrigger checks")
    $prev = (git rev-parse --abbrev-ref HEAD 2>$null).Trim()
    Write-Host ("  [INFO] Current: {0} -> Target: {1}" -f $prev, $TargetBranch) -ForegroundColor Cyan
    try {
        git fetch origin $TargetBranch 2>&1 | Out-Null
        if ($prev -ne $TargetBranch) {
            git switch $TargetBranch 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { git checkout $TargetBranch 2>&1 | Out-Null }
        } else { Write-Host "  [INFO] Already on target branch" -ForegroundColor Cyan }
        git commit --allow-empty -m $Message 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Host "  [ERROR] empty commit failed" -ForegroundColor Red; return $false }
        $hasUpstream = (git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null)
        if ([string]::IsNullOrEmpty($hasUpstream)) { git push -u origin $TargetBranch 2>&1 | Out-Null } else { git push origin $TargetBranch 2>&1 | Out-Null }
        if ($LASTEXITCODE -ne 0) { Write-Host "  [ERROR] push failed" -ForegroundColor Red; return $false }
        Write-Host "  [OK] Empty commit pushed to $TargetBranch" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  [ERROR] Empty commit failed: $_" -ForegroundColor Red
        return $false
    } finally {
        if ($prev -and $prev -ne $TargetBranch) { git switch $prev 2>&1 | Out-Null }
    }
}

function Get-ActionRunsForPr {
    param([string]$HeadBranch)
    try {
        return (gh run list --branch $HeadBranch --event pull_request --json databaseId,workflowName,status,conclusion,url --limit 50 | ConvertFrom-Json)
    } catch { return @() }
}

function Invoke-ActionRunRerun {
    param([string]$RunId)
    try { gh run rerun $RunId 2>&1 | Out-Null; return ($LASTEXITCODE -eq 0) } catch { return $false }
}

function Invoke-CheckSuiteRerequest {
    param([string]$Owner,[string]$Repo,[string]$Sha,[array]$AppSlugFilter = @())
    $n = 0
    try {
        $suites = gh api "repos/$Owner/$Repo/commits/$Sha/check-suites" 2>$null | ConvertFrom-Json
        foreach($s in $suites.check_suites){
            $slug = $s.app.slug
            if ($AppSlugFilter.Count -gt 0 -and $slug -notin $AppSlugFilter) { continue }
            try { gh api -X POST "/repos/$Owner/$Repo/check-suites/$($s.id)/rerequest" 2>&1 | Out-Null; if ($LASTEXITCODE -eq 0){ $n++ } } catch {}
        }
    } catch {}
    return $n
}

function Test-AllRequiredChecksGreen {
    param([array]$Checks,[array]$RequiredNames)
    if ($RequiredNames.Count -eq 0) { Write-Host "  [INFO] No required checks defined" -ForegroundColor Cyan; return $true }
    foreach($name in $RequiredNames){
        $hit = $Checks | Where-Object { $_.Name -eq $name } | Select-Object -First 1
        if (-not $hit) { Write-Host "  [BLOCKER] Required check '$name' not found in statusCheckRollup" -ForegroundColor Red; return $false }
        if ($hit.Conclusion -ne 'SUCCESS') { Write-Host "  [BLOCKER] Required check '$name' is not green: $($hit.Status)/$($hit.Conclusion)" -ForegroundColor Red; return $false }
    }
    return $true
}

Export-ModuleMember -Function @(
  'Get-RepoSlug','Get-PrInfo','Get-RequiredContexts','Get-ActualCheckNames',
  'Get-ActualContexts','Test-RequiredContextsAttached','Push-EmptyCommit',
  'Get-ActionRunsForPr','Invoke-ActionRunRerun','Invoke-CheckSuiteRerequest','Test-AllRequiredChecksGreen'
)