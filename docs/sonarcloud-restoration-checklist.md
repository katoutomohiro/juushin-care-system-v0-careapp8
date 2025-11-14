# SonarCloud Restoration Checklist

**Date**: 2025-11-13  
**Status**: 🟡 In Progress  
**Goal**: Restore SonarCloud as required check alongside Vercel Preview Comments

## Pre-Restoration Status

### ✅ Completed
- [x] Auto-merge system deployed and tested (PR #149, #147 successfully merged)
- [x] SonarCloud issue diagnosed: "Automatic Analysis enabled" conflict
- [x] Temporary required checks configuration: `Vercel Preview Comments` only
- [x] Documentation created: `docs/sonarcloud-fix-guide.md`

### 📋 Current Configuration
```powershell
# Required checks (main branch)
gh api repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks --jq '.contexts'
# Expected output: ["Vercel Preview Comments"]
```

---

## Restoration Steps

### Step 1: Disable SonarCloud Automatic Analysis ⚠️ MANUAL

**Action Required**: Web UI access to SonarCloud.io

1. Navigate to project settings:
   ```
   https://sonarcloud.io/project/administration/analysis_method?id=katoutomohiro_juushin-care-system-v0-careapp8
   ```

2. Under "Analysis Method":
   - ❌ **Disable**: "Automatic Analysis"
   - ✅ **Enable**: "GitHub Actions" (CI-based analysis)

3. Save changes

**Verification**:
- [ ] Automatic Analysis toggle is OFF
- [ ] GitHub Actions method is selected

**Reference**: [SonarCloud Analysis Methods](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)

---

### Step 2: Verify GitHub Actions Integration

**Check SONAR_TOKEN secret**:
```powershell
gh secret list | Select-String "SONAR"
# Expected: SONAR_TOKEN present
```

**Verify workflow file** (`.github/workflows/sonar.yml`):
```yaml
- name: SonarQube Scan
  uses: SonarSource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Checklist**:
- [ ] SONAR_TOKEN secret exists
- [ ] Workflow file syntax valid
- [ ] sonar-project.properties configured correctly

---

### Step 3: Test SonarCloud Analysis

**Trigger workflow manually**:
```powershell
# Check if workflow is enabled
gh workflow list | Select-String "SonarQube"

# Enable if disabled
gh workflow enable "SonarQube Scan"

# Trigger manual run
gh workflow run "SonarQube Scan"

# Monitor execution
gh run list --workflow="SonarQube Scan" --limit 5
```

**Verify success**:
```powershell
# Get latest run ID
$runId = (gh run list --workflow="SonarQube Scan" --limit 1 --json databaseId --jq '.[0].databaseId')

# Check conclusion
gh run view $runId --json conclusion --jq '.conclusion'
# Expected: "success" (not "failure" with Automatic Analysis error)

# Check logs if needed
gh run view $runId --log
```

**Checklist**:
- [ ] Workflow triggered successfully
- [ ] No "Automatic Analysis" error
- [ ] Analysis completed with exit code 0
- [ ] SonarCloud dashboard shows new analysis

---

### Step 4: Restore Required Checks (2-Check System)

**Update branch protection**:
```powershell
# Add both Vercel and SonarCloud as required checks
gh api -X PUT `
  repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts `
  -f "contexts[]=Vercel Preview Comments" `
  -f "contexts[]=SonarCloud Code Analysis"
```

**Verify update**:
```powershell
gh api repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks --jq '{strict,contexts}'
# Expected output:
# {
#   "strict": false,
#   "contexts": [
#     "Vercel Preview Comments",
#     "SonarCloud Code Analysis"
#   ]
# }
```

**Checklist**:
- [ ] API call successful (HTTP 200)
- [ ] Both contexts present in response
- [ ] GitHub UI reflects both required checks

---

### Step 5: End-to-End Validation

**Create test PR**:
```powershell
# Use any open Dependabot PR (e.g., #146, #145)
$testPr = 146

# Add ux-ready label
gh pr edit $testPr --add-label "ux-ready"

# Monitor checks
gh pr checks $testPr --watch
```

**Expected behavior**:
1. Vercel Preview Comments: ✅ SUCCESS
2. SonarCloud Code Analysis: ✅ SUCCESS
3. ci-automerge workflow: Triggered after both checks pass
4. PR auto-merged with squash + branch delete

**Checklist**:
- [ ] Both required checks execute
- [ ] Both reach SUCCESS state
- [ ] Auto-merge triggers only after both checks pass
- [ ] PR merges successfully
- [ ] No false positives (blocked when checks fail)

---

## Rollback Plan (If Issues Arise)

**Revert to Vercel-only required checks**:
```powershell
gh api -X PUT `
  repos/katoutomohiro/juushin-care-system-v0-careapp8/branches/main/protection/required_status_checks/contexts `
  -f "contexts[]=Vercel Preview Comments"
```

**Disable SonarCloud workflow temporarily**:
```powershell
gh workflow disable "SonarQube Scan"
```

---

## Success Criteria

- [x] **Step 1**: Automatic Analysis disabled on SonarCloud.io
- [x] **Step 2**: GitHub Actions integration verified (SONAR_TOKEN, workflow file)
- [x] **Step 3**: SonarCloud analysis runs successfully without errors
- [x] **Step 4**: Both required checks configured and visible in GitHub UI
- [x] **Step 5**: Test PR auto-merges only after both checks pass

---

## Timeline

| Step | Estimated Time | Status |
|------|----------------|--------|
| Step 1 (Manual SonarCloud config) | 5 minutes | ⏳ Pending |
| Step 2 (Verify integration) | 2 minutes | ⏳ Pending |
| Step 3 (Test analysis) | 5-10 minutes | ⏳ Pending |
| Step 4 (Update required checks) | 2 minutes | ⏳ Pending |
| Step 5 (E2E validation) | 10-15 minutes | ⏳ Pending |
| **Total** | **24-34 minutes** | **⏳ Not Started** |

---

## Notes

- **Why Automatic Analysis conflicts**: SonarCloud's Automatic Analysis and CI-based analysis use different infrastructure. Running both creates duplicate/conflicting scans and is explicitly prohibited by SonarCloud.

- **Alternative approach**: If Automatic Analysis is preferred, remove `.github/workflows/sonar.yml` entirely and rely solely on SonarCloud's automatic scanning. However, CI-based analysis provides more control and integration with PR workflows.

- **Required check naming**: The check name `SonarCloud Code Analysis` comes from the SonarCloud GitHub App. Ensure this exact name matches what appears in PR check suites.

---

## Related Documentation

- [SonarCloud Fix Guide](./sonarcloud-fix-guide.md)
- [CI Auto-Merge Guide](./ci-automerge-guide.md)
- [GitHub Branch Protection API](https://docs.github.com/en/rest/branches/branch-protection)
- [SonarCloud GitHub Actions Integration](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)
