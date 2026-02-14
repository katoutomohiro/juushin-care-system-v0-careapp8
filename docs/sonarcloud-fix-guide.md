# SonarCloud Integration Fix Guide

## Current Status (2025-11-13)

### 笨・Working Components
- **Auto-merge system**: Production ready and tested
- **PR #149**: Successfully auto-merged (Dependabot minor/patch updates)
- **PR #147**: Successfully auto-merged (actions/checkout bump)
- **Required checks**: Currently `Vercel Preview Comments` only (stable)

### 笞・・Known Issue: SonarCloud Analysis Failure

**Error Message:**
```
ERROR You are running CI analysis while Automatic Analysis is enabled. 
Please consider disabling one or the other.
```

**Root Cause:**
- SonarCloud project has "Automatic Analysis" enabled
- This conflicts with GitHub Actions CI-based analysis
- Both cannot run simultaneously per SonarCloud policy

## Fix Steps (Requires SonarCloud.io Access)

### Step 1: Disable Automatic Analysis

1. Navigate to SonarCloud project settings:
   ```
   https://sonarcloud.io/project/administration/analysis_method?id=katoutomohiro_juushin-care-system-v0-careapp8
   ```

2. Under "Analysis Method":
   - **Disable**: "Automatic Analysis"
   - **Keep**: "GitHub Actions" as the analysis method

3. Save changes

**Reference**: [SonarCloud Analysis Methods Documentation](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)

### Step 2: Verify GitHub Actions Integration

1. Ensure `SONAR_TOKEN` secret is valid:
   ```powershell
   gh secret list | Select-String "SONAR"
   ```

2. Verify sonar-project.properties:
   ```properties
   sonar.projectKey=katoutomohiro_juushin-care-system-v0-careapp8
   sonar.organization=katoutomohiro
   sonar.sources=src,app,components,lib,hooks,services
   sonar.tests=tests
   ```

3. Check workflow configuration:
   ```yaml
   # .github/workflows/sonar.yml
   - name: SonarQube Scan
     uses: SonarSource/sonarqube-scan-action@master
     env:
       SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
   ```

### Step 3: Test SonarCloud Analysis

1. Trigger workflow manually:
   ```powershell
   gh workflow run "SonarQube Scan"
   ```

2. Monitor execution:
   ```powershell
   gh run list --workflow="SonarQube Scan" --limit 1
   gh run watch <RUN_ID>
   ```

3. Verify success (no "Automatic Analysis" error)

### Step 4: Restore Required Checks (After Verification)

Once SonarCloud analysis is working:

```powershell
# Restore both required checks to branch protection
gh api -X PUT repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts `
  -f "contexts[]=SonarCloud Code Analysis" `
  -f "contexts[]=Vercel Preview Comments"
```

**Verification:**
```powershell
gh api repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks --jq '.contexts'
# Expected output:
# [
#   "SonarCloud Code Analysis",
#   "Vercel Preview Comments"
# ]
```

## Temporary Workaround (Current State)

**What's Active:**
- Required checks: `Vercel Preview Comments` only
- SonarQube Scan workflow: Still running but not blocking merges
- Auto-merge: Fully functional with Vercel gating

**Why This Works:**
- Vercel Preview Comments is a reliable, always-present check
- Auto-merge workflow validates check presence before monitoring
- SonarCloud can be fixed independently without blocking development

## Alternative: Disable SonarQube Workflow Temporarily

If you want to stop failed SonarCloud runs entirely:

```powershell
# Disable workflow (requires admin permissions)
gh workflow disable "SonarQube Scan"

# Re-enable after fix
gh workflow enable "SonarQube Scan"
```

## Related Commands

### Check current required contexts
```powershell
gh api repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks --jq '.contexts'
```

### View SonarCloud check suite status
```powershell
$sha = gh pr view <PR_NUMBER> --json headRefOid --jq .headRefOid
gh api "repos/katoutomohiro/juushin-care-system-v0-careapp8/commits/$sha/check-suites" --jq '.check_suites[] | select(.app.slug=="sonarcloud") | {id,status,conclusion}'
```

### Manually re-request SonarCloud check
```powershell
$sha = gh pr view <PR_NUMBER> --json headRefOid --jq .headRefOid
$suiteId = gh api "repos/katoutomohiro/juushin-care-system-v0-careapp8/commits/$sha/check-suites" --jq '.check_suites[] | select(.app.slug=="sonarcloud") | .id'
gh api -X POST "repos/katoutomohiro/juushin-care-system-v0-careapp8/check-suites/$suiteId/rerequest"
```

## Success Criteria

After completing the fix:

1. 笨・SonarQube Scan workflow runs without "Automatic Analysis" error
2. 笨・"SonarCloud Code Analysis" check appears on PRs
3. 笨・Check conclusion is SUCCESS (or actionable FAILURE with quality gate details)
4. 笨・Both required checks enforce gating: Vercel + SonarCloud
5. 笨・Auto-merge respects both checks before merging

## References

- [SonarCloud GitHub Actions Integration](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)
- [GitHub Branch Protection API](https://docs.github.com/en/rest/branches/branch-protection)
- [GitHub Check Runs API](https://docs.github.com/en/rest/checks/runs)
- [GitHub Actions Workflow Commands](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions)

---

**Status**: 搭 Awaiting SonarCloud.io configuration fix  
**Impact**: Low - Auto-merge operational with Vercel gating  
**Priority**: Medium - Quality gate restoration desired but not blocking

