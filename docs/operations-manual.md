# Auto-Merge System - Operations Manual

**Version**: 1.0  
**Last Updated**: 2025-11-13  
**Status**: 🟢 Production

---

## System Overview

### Architecture

**Branch Protection (main)**:
```json
{
  "strict": true,
  "contexts": [
    "Vercel Preview Comments",
    "SonarCloud Code Analysis"
  ]
}
```

**Auto-Merge Workflow**: `.github/workflows/ci-automerge.yml`
- **Trigger**: PR events (opened, synchronize, reopened, ready_for_review, labeled, unlabeled)
- **Gating**: `ux-ready` label required, `no-auto-merge` emergency stop
- **Safety**: Fork PR exclusion, per-PR concurrency control
- **Timeout**: 30 minutes

**SonarCloud Integration**:
- **Method**: Automatic Analysis (SonarCloud App)
- **CI Workflow**: Disabled (ID: 205883970) - conflicts with Automatic Analysis
- **Check Name**: `SonarCloud Code Analysis`

---

## Daily Operations

### Adding PR to Auto-Merge Queue

```powershell
# Single PR
gh pr edit <PR_NUMBER> --add-label "ux-ready"

# Multiple PRs (batch)
gh pr edit 123 --add-label "ux-ready"
gh pr edit 124 --add-label "ux-ready"
gh pr edit 125 --add-label "ux-ready"
```

**Expected Behavior**:
1. `ux-ready` label added → ci-automerge workflow triggered
2. Workflow monitors both required checks
3. When both reach SUCCESS → Auto squash merge + delete branch
4. Merge time: ~15-20 seconds after checks complete

### Emergency Stop (Block Specific PR)

```powershell
gh pr edit <PR_NUMBER> --add-label "no-auto-merge"
```

**Effect**: Workflow will skip this PR even if `ux-ready` is present.

### Resume Auto-Merge

```powershell
gh pr edit <PR_NUMBER> --remove-label "no-auto-merge"
```

---

## Monitoring

### Check Auto-Merge Status

```powershell
# Recent workflow runs
gh run list --workflow="ci-automerge" --limit 10 --json databaseId,status,conclusion,createdAt,headBranch

# Watch specific run
gh run watch <RUN_ID>

# View failure logs
gh run view <RUN_ID> --log-failed
```

### Verify Required Checks on PR

```powershell
# Quick check
gh pr checks <PR_NUMBER>

# Detailed status
$pr = gh pr view <PR_NUMBER> --json statusCheckRollup | ConvertFrom-Json
$pr.statusCheckRollup | Where-Object { $_.name -in @('Vercel Preview Comments', 'SonarCloud Code Analysis') } | Format-Table name,status,conclusion -AutoSize
```

### Inspect Check Details

```powershell
# Get commit SHA
$sha = gh pr view <PR_NUMBER> --json headRefOid --jq .headRefOid

# List all checks
gh api "repos/katoutomohiro/juushin-care-system-v0-careapp8/commits/$sha/check-runs" | ConvertFrom-Json | Select-Object -ExpandProperty check_runs | Select-Object name,status,conclusion,started_at,completed_at | Format-Table -AutoSize

# Filter specific checks
gh api "repos/katoutomohiro/juushin-care-system-v0-careapp8/commits/$sha/check-runs" | ConvertFrom-Json | Select-Object -ExpandProperty check_runs | Where-Object { $_.name -like '*SonarCloud*' }
```

---

## Troubleshooting

### Issue 1: PR Not Auto-Merging

**Symptoms**: PR has `ux-ready` label but not merging

**Diagnosis**:
```powershell
# 1. Check workflow runs
gh run list --workflow="ci-automerge" --limit 5

# 2. Check if workflow was triggered
$runs = gh run list --workflow="ci-automerge" --limit 20 --json headBranch,conclusion,createdAt | ConvertFrom-Json
$runs | Where-Object { $_.headBranch -like '*<PR_BRANCH>*' }

# 3. Check required checks status
gh pr checks <PR_NUMBER>

# 4. Verify labels
gh pr view <PR_NUMBER> --json labels --jq '.labels[].name'
```

**Common Causes**:
1. **Required check still pending**: Wait for Vercel/SonarCloud to complete
2. **Required check failed**: Fix code issues, push update
3. **Branch behind base**: PR needs update-branch
4. **Missing `ux-ready` label**: Add label
5. **Has `no-auto-merge` label**: Remove label
6. **Fork PR**: Auto-merge skips fork PRs (security)

**Solutions**:
```powershell
# Update branch if behind
gh api -X PUT "repos/katoutomohiro/juushin-care-system-v0-careapp8/pulls/<PR_NUMBER>/update-branch" -f "expected_head_sha=$(gh pr view <PR_NUMBER> --json headRefOid --jq .headRefOid)"

# Re-trigger workflow (remove and re-add label)
gh pr edit <PR_NUMBER> --remove-label "ux-ready"
Start-Sleep -Seconds 2
gh pr edit <PR_NUMBER> --add-label "ux-ready"

# Manual merge (if needed)
gh pr merge <PR_NUMBER> --squash --delete-branch
```

### Issue 2: SonarCloud Check Stuck/Failed

**Symptoms**: `SonarCloud Code Analysis` pending or failed

**Diagnosis**:
```powershell
# Check SonarCloud check details
$sha = gh pr view <PR_NUMBER> --json headRefOid --jq .headRefOid
gh api "repos/katoutomohiro/juushin-care-system-v0-careapp8/commits/$sha/check-runs" | ConvertFrom-Json | Select-Object -ExpandProperty check_runs | Where-Object { $_.name -eq 'SonarCloud Code Analysis' } | Select-Object name,status,conclusion,details_url
```

**Temporary Workaround** (if SonarCloud service down):
```powershell
# Switch to Vercel-only required checks
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]=Vercel Preview Comments"

# Verify update
gh api repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks --jq '.contexts'
```

**Restore after SonarCloud recovers**:
```powershell
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]=Vercel Preview Comments" -f "contexts[]=SonarCloud Code Analysis"
```

### Issue 3: Vercel Preview Stuck

**Symptoms**: `Vercel Preview Comments` pending for long time

**Diagnosis**:
- Check Vercel dashboard: https://vercel.com/
- Verify deployment status

**Workaround**: Usually resolves itself within 5-10 minutes. If stuck >30 minutes:
```powershell
# Re-run checks (push empty commit)
git commit --allow-empty -m "chore: trigger checks re-run"
git push
```

### Issue 4: Workflow Skipped Despite Labels

**Symptoms**: Workflow shows `conclusion: skipped`

**Diagnosis**:
```powershell
# View workflow run details
gh run view <RUN_ID> --json jobs --jq '.jobs[] | {name,conclusion,steps}'

# Check if conditions
# Common causes:
# - PR is draft (if: github.event.pull_request.draft == false)
# - Labels don't match (if: contains(..., 'ux-ready'))
# - Fork PR (if: github.event.pull_request.head.repo.full_name == github.repository)
```

**Solution**: Check PR state and labels match workflow conditions

---

## Emergency Procedures

### Complete System Bypass (Urgent Merge Needed)

**Scenario**: Critical hotfix needed, checks failing but code is safe

```powershell
# Option 1: Temporary disable required checks (requires admin)
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]="

# Merge PR
gh pr merge <PR_NUMBER> --squash --delete-branch --admin

# Restore required checks
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]=Vercel Preview Comments" -f "contexts[]=SonarCloud Code Analysis"
```

**Option 2**: Use `--admin` flag (override required checks)
```powershell
gh pr merge <PR_NUMBER> --squash --delete-branch --admin
```

**⚠️ Warning**: Document reason in PR comment before using admin override.

### Disable Auto-Merge System

**Scenario**: System misbehaving, need to stop all auto-merges

```powershell
# Disable workflow
gh workflow disable "ci-automerge"

# Verify disabled
gh workflow list | Select-String "ci-automerge"
```

**Re-enable**:
```powershell
gh workflow enable "ci-automerge"
```

### Rollback to Vercel-Only Checks

**Scenario**: SonarCloud extended outage

```powershell
# Switch to Vercel-only
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]=Vercel Preview Comments"

# Update documentation
# (Note: Auto-merge will still work with single check)
```

---

## Maintenance

### Weekly Health Check

```powershell
# 1. Check recent auto-merge success rate
gh run list --workflow="ci-automerge" --limit 50 --json conclusion | ConvertFrom-Json | Group-Object conclusion | Select-Object Name,Count

# 2. Verify required checks configuration
gh api repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks --jq '{strict,contexts}'

# 3. Check for stale PRs with ux-ready but not merged
gh pr list --label "ux-ready" --state open
```

**Expected Results**:
- Success rate: >95%
- Required checks: 2 items (Vercel + SonarCloud)
- Stale PRs: <3 (investigate if >5)

### Monthly Review

1. **Performance Metrics**:
   ```powershell
   # Average merge time (from check completion to merge)
   # Manual analysis: Review last 20 merged PRs
   gh pr list --state merged --limit 20 --json number,mergedAt,title
   ```

2. **Failure Analysis**:
   ```powershell
   # Failed runs in last month
   gh run list --workflow="ci-automerge" --created ">2025-10-13" --json conclusion,createdAt,headBranch | ConvertFrom-Json | Where-Object { $_.conclusion -eq 'failure' }
   ```

3. **Update Helper Scripts** (if needed):
   - `scripts/enable-automerge.ps1`
   - `scripts/validate-branch-protection.ps1`

---

## Advanced Operations

### Batch Enable Auto-Merge for Dependabot PRs

```powershell
# Get all open Dependabot PRs
$dependabotPRs = gh pr list --author "app/dependabot" --state open --json number,title | ConvertFrom-Json

# Add ux-ready label to all
foreach ($pr in $dependabotPRs) {
    Write-Host "Enabling auto-merge for PR #$($pr.number): $($pr.title)"
    gh pr edit $pr.number --add-label "ux-ready"
    Start-Sleep -Seconds 1  # Rate limit protection
}

# Monitor progress
gh run list --workflow="ci-automerge" --limit 10
```

### Custom Check Wait Script

```powershell
# Wait for specific PR checks to complete
param([int]$PrNumber, [int]$TimeoutMinutes = 30)

$deadline = (Get-Date).AddMinutes($TimeoutMinutes)
while ((Get-Date) -lt $deadline) {
    $pr = gh pr view $PrNumber --json statusCheckRollup | ConvertFrom-Json
    $requiredChecks = $pr.statusCheckRollup | Where-Object { 
        $_.name -in @('Vercel Preview Comments', 'SonarCloud Code Analysis') 
    }
    
    $allSuccess = ($requiredChecks | Where-Object { 
        $_.status -eq 'COMPLETED' -and $_.conclusion -eq 'SUCCESS' 
    }).Count -eq 2
    
    if ($allSuccess) {
        Write-Host "✅ All required checks passed for PR #$PrNumber"
        return $true
    }
    
    Write-Host "⏳ Waiting for checks... (${TimeoutMinutes}m timeout)"
    Start-Sleep -Seconds 30
}

Write-Host "❌ Timeout waiting for checks"
return $false
```

### Re-request Failed Checks

```powershell
# Re-request all failed checks on a PR
$sha = gh pr view <PR_NUMBER> --json headRefOid --jq .headRefOid
$checkSuites = gh api "repos/katoutomohiro/juushin-care-system-v0-careapp8/commits/$sha/check-suites" | ConvertFrom-Json

foreach ($suite in $checkSuites.check_suites | Where-Object { $_.conclusion -eq 'failure' }) {
    Write-Host "Re-requesting check suite: $($suite.app.name)"
    gh api -X POST "repos/katoutomohiro/juushin-care-system-v0-careapp8/check-suites/$($suite.id)/rerequest"
}
```

---

## Configuration Reference

### Workflow File

**Location**: `.github/workflows/ci-automerge.yml`

**Key Settings**:
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review, labeled, unlabeled]
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  checks: read

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  auto-merge:
    timeout-minutes: 30
    if: >
      (github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository) &&
      (github.event_name == 'workflow_dispatch' || (
        contains(fromJson(toJson(github.event.pull_request.labels)).*.name, 'ux-ready') &&
        !contains(fromJson(toJson(github.event.pull_request.labels)).*.name, 'no-auto-merge')
      ))
```

**Main Script**: `scripts/ci_automerge.ps1`

**Helper Module**: `scripts/modules/CiUtils.psm1`

### Branch Protection API Endpoints

**Get current settings**:
```
GET /repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks
```

**Update required contexts**:
```
PUT /repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts
Body: { "contexts": ["Vercel Preview Comments", "SonarCloud Code Analysis"] }
```

---

## Future Enhancement Options

### Option 1: Migrate to CI-based Analysis (for Coverage Gating)

**When Needed**: Test coverage becomes critical gate

**Steps**:
1. SonarCloud.io → Project Settings → Analysis Method → Disable "Automatic Analysis"
2. Enable "GitHub Actions" method
3. Re-enable workflow:
   ```powershell
   gh workflow enable 205883970
   ```
4. Update workflow to include coverage:
   ```yaml
   - name: SonarCloud Scan
     env:
       SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
     run: |
       sonar-scanner \
         -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
   ```
5. Test on PR
6. Verify check name (may change to different name)
7. Update required contexts if needed

**Trade-offs**:
- ✅ Full control over scan configuration
- ✅ Coverage reporting and gating
- ❌ More complex workflow maintenance
- ❌ Longer analysis time

### Option 2: Slack Notifications

**Integration**:
```yaml
# Add to ci-automerge.yml
- name: Notify Slack on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Auto-merge failed for PR #${{ github.event.pull_request.number }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "❌ *Auto-merge failed*\n<${{ github.event.pull_request.html_url }}|PR #${{ github.event.pull_request.number }}>: ${{ github.event.pull_request.title }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Option 3: Auto-Update Branch Before Merge

**Already handled**: GitHub's strict: true setting requires branches to be up-to-date

**Manual trigger if needed**:
```powershell
gh api -X PUT "repos/katoutomohiro/juushin-care-system-v0-careapp8/pulls/<PR_NUMBER>/update-branch" -f "expected_head_sha=$(gh pr view <PR_NUMBER> --json headRefOid --jq .headRefOid)"
```

---

## Contact & Escalation

**Documentation**:
- [CI Auto-Merge Guide](./ci-automerge-guide.md)
- [SonarCloud Fix Guide](./sonarcloud-fix-guide.md)
- [SonarCloud Restoration Report](./sonarcloud-restoration-report.md)

**GitHub References**:
- [Branch Protection API](https://docs.github.com/en/rest/branches/branch-protection)
- [Checks API](https://docs.github.com/en/rest/checks/runs)
- [SonarCloud Automatic Analysis](https://docs.sonarsource.com/sonarcloud/advanced-setup/automatic-analysis/)

**Quick Reference Commands**:
```powershell
# Enable auto-merge on PR
gh pr edit <PR> --add-label "ux-ready"

# Emergency stop PR
gh pr edit <PR> --add-label "no-auto-merge"

# Check system health
gh run list --workflow="ci-automerge" --limit 10

# Verify branch protection
gh api repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks --jq '.contexts'

# Temporary Vercel-only mode
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]=Vercel Preview Comments"

# Restore 2-check mode
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]=Vercel Preview Comments" -f "contexts[]=SonarCloud Code Analysis"
```

---

**Last Reviewed**: 2025-11-13  
**System Status**: 🟢 Production Ready  
**Auto-Merge Success Rate**: 100% (7/7 PRs)
