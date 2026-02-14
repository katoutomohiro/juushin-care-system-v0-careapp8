# Auto-Merge Quick Reference Card

## 噫 Daily Operations

### Enable Auto-Merge on PR
```powershell
gh pr edit <PR_NUMBER> --add-label "ux-ready"
```

### Emergency Stop Specific PR
```powershell
gh pr edit <PR_NUMBER> --add-label "no-auto-merge"
```

### Check Auto-Merge Status
```powershell
gh run list --workflow="ci-automerge" --limit 10
```

### Monitor PR Checks
```powershell
gh pr checks <PR_NUMBER>
```

---

## 笞・・Emergency Procedures

### Temporary Switch to Vercel-Only (SonarCloud Down)
```powershell
# Switch
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]=Vercel Preview Comments"

# Restore (after recovery)
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts -f "contexts[]=Vercel Preview Comments" -f "contexts[]=SonarCloud Code Analysis"
```

### Disable Auto-Merge System
```powershell
gh workflow disable "ci-automerge"
```

### Manual Merge (Override Checks)
```powershell
gh pr merge <PR_NUMBER> --squash --delete-branch --admin
```

---

## 剥 Troubleshooting

### PR Not Auto-Merging?

**Check 1**: Required checks status
```powershell
gh pr checks <PR_NUMBER>
```
**Fix**: Wait for checks or fix failing tests

**Check 2**: Labels present?
```powershell
gh pr view <PR_NUMBER> --json labels --jq '.labels[].name'
```
**Fix**: Add `ux-ready`, remove `no-auto-merge`

**Check 3**: Branch up-to-date?
```powershell
gh pr view <PR_NUMBER> --json mergeStateStatus
```
**Fix**: Update branch
```powershell
gh api -X PUT "repos/katoutomohiro/juushin-care-system-v0-careapp8/pulls/<PR_NUMBER>/update-branch" -f "expected_head_sha=$(gh pr view <PR_NUMBER> --json headRefOid --jq .headRefOid)"
```

**Check 4**: Workflow triggered?
```powershell
gh run list --workflow="ci-automerge" --limit 5
```
**Fix**: Re-trigger by removing and re-adding label
```powershell
gh pr edit <PR_NUMBER> --remove-label "ux-ready"
gh pr edit <PR_NUMBER> --add-label "ux-ready"
```

---

## 投 Health Monitoring

### Verify Branch Protection
```powershell
gh api repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks --jq '{strict,contexts}'
```
**Expected**:
```json
{
  "strict": true,
  "contexts": [
    "Vercel Preview Comments",
    "SonarCloud Code Analysis"
  ]
}
```

### Check Recent Success Rate
```powershell
gh run list --workflow="ci-automerge" --limit 50 --json conclusion | ConvertFrom-Json | Group-Object conclusion | Select-Object Name,Count
```
**Target**: >95% success rate

### Find Stale PRs with ux-ready
```powershell
gh pr list --label "ux-ready" --state open
```
**Action**: Investigate if >3 found

---

## 屏・・Configuration

### System Components
- **Workflow**: `.github/workflows/ci-automerge.yml`
- **Main Script**: `scripts/ci_automerge.ps1`
- **Helper Module**: `scripts/modules/CiUtils.psm1`

### Required Checks
1. **Vercel Preview Comments** (app_id: 8329)
2. **SonarCloud Code Analysis** (app_id: 12526)

### SonarCloud Method
- **Type**: Automatic Analysis (SonarCloud App)
- **CI Workflow**: Disabled (ID: 205883970)
- **Why**: Automatic and CI analysis conflict

### Safety Controls
- 笨・Fork PR exclusion
- 笨・`no-auto-merge` emergency stop
- 笨・Per-PR concurrency control
- 笨・30-minute timeout

---

## 答 Documentation

- [Operations Manual](./operations-manual.md) - Complete guide
- [CI Auto-Merge Guide](./ci-automerge-guide.md) - Technical details
- [SonarCloud Restoration Report](./sonarcloud-restoration-report.md) - Setup history

---

**Status**: 泙 Production  
**Success Rate**: 100% (7/7 PRs validated)  
**Last Updated**: 2025-11-13

