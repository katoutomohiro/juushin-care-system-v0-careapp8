# CI Auto-Merge Operator

螳牙・縺ｪ PR 閾ｪ蜍輔・繝ｼ繧ｸ繧ｷ繧ｹ繝・Β - 繝ｩ繝吶Ν繝吶・繧ｹ縺ｮ蛻ｶ蠕｡縺ｨ螟壼ｱ､髦ｲ蠕｡

## 識 讎りｦ・
縺薙・繧ｷ繧ｹ繝・Β縺ｯ縲∝ｿ・医メ繧ｧ繝・け縺檎ｷ代↓縺ｪ縺｣縺・PR 繧・**莠ｺ髢薙・蛻､譁ｭ繧貞ｰ企㍾縺励↑縺後ｉ** 閾ｪ蜍慕噪縺ｫ繝槭・繧ｸ縺励∪縺吶・
### 荳ｻ縺ｪ迚ｹ蠕ｴ

- 笨・**繝ｩ繝吶Ν繝吶・繧ｹ襍ｷ蜍・*: `ux-ready` 繝ｩ繝吶Ν縺ｧ譏守､ｺ逧・↓譛牙柑蛹・- 尅 **髱槫ｸｸ蛛懈ｭ｢讖溯・**: `no-auto-merge` 繝ｩ繝吶Ν縺ｧ蜊ｳ蠎ｧ縺ｫ蛛懈ｭ｢
- 白 **繝輔か繝ｼ繧ｯ菫晁ｭｷ**: 螟夜Κ繝輔か繝ｼ繧ｯ逕ｱ譚･縺ｮ PR 縺ｯ閾ｪ蜍募ｮ溯｡悟ｯｾ雎｡螟・- 柏 **譛蟆乗ｨｩ髯・*: `contents:write`, `pull-requests:write`, `checks:read` 縺ｮ縺ｿ
- 圜 **謗剃ｻ門宛蠕｡**: PR 蜊倅ｽ阪〒蜊倅ｸ霍ｯ邱壹∝､夐㍾繝槭・繧ｸ繧帝亟豁｢
- 投 **謨ｴ蜷域ｧ繝√ぉ繝・け**: required contexts 縺ｨ螳溘メ繧ｧ繝・け蜷阪・荳閾ｴ繧呈､懆ｨｼ

## 噫 菴ｿ縺・婿

### 1. 蝓ｺ譛ｬ逧・↑菴ｿ縺・婿・域耳螂ｨ・・
```powershell
# PR 縺ｫ ux-ready 繝ｩ繝吶Ν繧剃ｻ倅ｸ・+ Auto-merge 譛牙柑蛹・.\scripts\enable-automerge.ps1 -Pr 149
```

縺薙ｌ縺縺代〒莉･荳九′閾ｪ蜍募ｮ溯｡後＆繧後∪縺・
1. `ux-ready` 繝ｩ繝吶Ν莉倅ｸ趣ｼ医Ρ繝ｼ繧ｯ繝輔Ο繝ｼ繝医Μ繧ｬ繝ｼ・・2. GitHub Auto-merge 譛牙柑蛹厄ｼ・quash + delete-branch・・3. 蠢・医メ繧ｧ繝・け縺ｮ迥ｶ諷狗｢ｺ隱・
### 2. 謇句虚縺ｧ縺ｮ GitHub CLI 謫堺ｽ・
```powershell
# 繝ｩ繝吶Ν莉倅ｸ・gh pr edit 149 --add-label 'ux-ready'

# Auto-merge 譛牙柑蛹・gh pr merge 149 --auto --squash --delete-branch
```

### 3. 髱槫ｸｸ蛛懈ｭ｢・医・繝ｼ繧ｸ繧呈ｭ｢繧√◆縺・ｴ蜷茨ｼ・
```powershell
# no-auto-merge 繝ｩ繝吶Ν繧剃ｻ倅ｸ・gh pr edit 149 --add-label 'no-auto-merge'

# 縺ｾ縺溘・ ux-ready 繝ｩ繝吶Ν繧貞炎髯､
gh pr edit 149 --remove-label 'ux-ready'
```

## 剥 讀懆ｨｼ繝・・繝ｫ

### 繝悶Λ繝ｳ繝∽ｿ晁ｭｷ謨ｴ蜷域ｧ繝√ぉ繝・け

```powershell
# 譛譁ｰ縺ｮ PR 縺ｧ讀懆ｨｼ
.\scripts\validate-branch-protection.ps1

# 迚ｹ螳壹・ PR 縺ｧ讀懆ｨｼ
.\scripts\validate-branch-protection.ps1 -PrNumber 149

# 荳堺ｸ閾ｴ繧定・蜍穂ｿｮ豁｣
.\scripts\validate-branch-protection.ps1 -PrNumber 149 -AutoFix
```

縺薙・繧ｹ繧ｯ繝ｪ繝励ヨ縺ｯ莉･荳九ｒ遒ｺ隱阪＠縺ｾ縺・
- `main` 繝悶Λ繝ｳ繝√・ required status checks
- 螳滄圀縺ｮ check-runs 蜷・- 荳堺ｸ閾ｴ縺後≠繧後・菫ｮ豁｣繧ｳ繝槭Φ繝峨ｒ謠千､ｺ

## 搭 蜑肴署譚｡莉ｶ

### 繝ｪ繝昴ず繝医Μ險ｭ螳・
1. **Auto-merge 縺ｮ險ｱ蜿ｯ**
   - Settings 竊・General 竊・Pull Requests
   - 笨・Allow auto-merge

2. **繝悶Λ繝ｳ繝∽ｿ晁ｭｷ・・ain・・*
   - Settings 竊・Branches 竊・main 竊・Edit
   - 笨・Require status checks to pass before merging
   - Required checks:
     - `SonarCloud Code Analysis`
     - `Vercel Preview Comments`

3. **蠢・医Λ繝吶Ν**
   - `ux-ready`: Auto-merge 繧呈怏蜉ｹ蛹悶☆繧九ヨ繝ｪ繧ｬ繝ｼ
   - `no-auto-merge`: 髱槫ｸｸ蛛懈ｭ｢逕ｨ・医が繝励す繝ｧ繝ｳ・・
### 繝ｭ繝ｼ繧ｫ繝ｫ迺ｰ蠅・
```powershell
# GitHub CLI 繧､繝ｳ繧ｹ繝医・繝ｫ遒ｺ隱・gh --version

# 隱崎ｨｼ
gh auth login

# 縺ｾ縺溘・迺ｰ蠅・､画焚
$env:GH_TOKEN = "ghp_xxxx..."
```

## 売 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ縺ｮ蜍穂ｽ・
```mermaid
graph TD
    A[PR opened/sync/labeled] --> B{Trigger譚｡莉ｶ}
    B -->|Fork PR| C[繧ｹ繧ｭ繝・・]
    B -->|ux-ready縺ｪ縺慾 C
    B -->|no-auto-merge| C
    B -->|OK| D[CiUtils.psm1 隱ｭ縺ｿ霎ｼ縺ｿ]
    D --> E[Test-RequiredContextsAttached]
    E -->|荳堺ｸ閾ｴ| F[菫ｮ豁｣繧ｳ繝槭Φ繝画署遉ｺ + exit 2]
    E -->|荳閾ｴ| G[逶｣隕悶Ν繝ｼ繝鈴幕蟋犠
    G --> H{蜈ｨ蠢・医メ繧ｧ繝・け邱・}
    H -->|No| I[30遘貞ｾ・ｩ歉
    I --> G
    H -->|Yes| J[Auto-merge 螳溯｡珪
    J --> K[繝悶Λ繝ｳ繝∝炎髯､]
```

### 繝医Μ繧ｬ繝ｼ譚｡莉ｶ

繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ縺ｯ莉･荳九・譚｡莉ｶ縺ｧ螳溯｡後＆繧後∪縺・

```yaml
if: >
  (繝輔か繝ｼ繧ｯ逕ｱ譚･縺ｧ縺ｪ縺・ AND
  (workflow_dispatch OR (
    ux-ready 繝ｩ繝吶Ν莉倅ｸ・AND
    no-auto-merge 繝ｩ繝吶Ν譛ｪ莉倅ｸ・  ))
```

## 屏・・繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・ぅ繝ｳ繧ｰ

### 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ縺瑚ｵｷ蜍輔＠縺ｪ縺・
```powershell
# 繝ｩ繝吶Ν遒ｺ隱・gh pr view 149 --json labels --jq '.labels[].name'

# 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ螳溯｡悟ｱ･豁ｴ
gh run list --workflow=ci-automerge.yml --limit 5
```

**遒ｺ隱阪・繧､繝ｳ繝・**
- 笨・`ux-ready` 繝ｩ繝吶Ν縺御ｻ倅ｸ弱＆繧後※縺・ｋ縺・- 笨・`no-auto-merge` 繝ｩ繝吶Ν縺御ｻ倅ｸ弱＆繧後※縺・↑縺・°
- 笨・PR 縺後ヵ繧ｩ繝ｼ繧ｯ逕ｱ譚･縺ｧ縺ｪ縺・°

### Auto-merge 縺梧怏蜉ｹ蛹悶〒縺阪↑縺・
```powershell
# 繝ｪ繝昴ず繝医Μ險ｭ螳夂｢ｺ隱・gh api repos/{owner}/{repo} --jq '.allow_auto_merge'
# 竊・true 縺ｧ縺ゅｋ縺薙→
```

### Required contexts 縺ｮ荳堺ｸ閾ｴ

```powershell
# 謨ｴ蜷域ｧ繝√ぉ繝・け螳溯｡・.\scripts\validate-branch-protection.ps1 -AutoFix
```

## 答 繝ｪ繝輔ぃ繝ｬ繝ｳ繧ｹ

### 繧ｳ繧｢繝｢繧ｸ繝･繝ｼ繝ｫ: CiUtils.psm1

| 髢｢謨ｰ | 隱ｬ譏・|
|------|------|
| `Get-RepoSlug` | owner/repo 蠖｢蠑上・繧ｹ繝ｩ繝・げ蜿門ｾ・|
| `Get-PrInfo` | PR 諠・ｱ蜿門ｾ暦ｼ・tatusCheckRollup 豁｣隕丞喧・・|
| `Get-RequiredContexts` | main 縺ｮ required contexts 蜿門ｾ・|
| `Get-ActualCheckNames` | **螳溘メ繧ｧ繝・け蜷榊叙蠕・*・・hecks API・・|
| `Test-RequiredContextsAttached` | **謨ｴ蜷域ｧ讀懆ｨｼ**・・equired vs actual・・|
| `Get-ActualContexts` | Status API + Checks API 邨仙粋 |
| `Push-EmptyCommit` | 遨ｺ繧ｳ繝溘ャ繝医・繝・す繝･ |
| `Get-ActionRunsForPr` | 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ螳溯｡御ｸ隕ｧ |
| `Invoke-ActionRunRerun` | 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ蜀榊ｮ溯｡・|
| `Invoke-CheckSuiteRerequest` | Check Suite 蜀阪Μ繧ｯ繧ｨ繧ｹ繝・|
| `Test-AllRequiredChecksGreen` | 蜈ｨ蠢・医メ繧ｧ繝・け謌仙粥遒ｺ隱・|

### 荳ｻ隕√せ繧ｯ繝ｪ繝励ヨ

| 繝輔ぃ繧､繝ｫ | 逕ｨ騾・|
|----------|------|
| `ci_automerge.ps1` | 閾ｪ蜍輔・繝ｼ繧ｸ逶｣隕悶せ繧ｯ繝ｪ繝励ヨ・医Ρ繝ｼ繧ｯ繝輔Ο繝ｼ縺九ｉ襍ｷ蜍包ｼ・|
| `enable-automerge.ps1` | **驕狗畑陬懷勧**: 繝ｯ繝ｳ繧ｳ繝槭Φ繝峨〒繝ｩ繝吶Ν+Auto-merge險ｭ螳・|
| `validate-branch-protection.ps1` | **謨ｴ蜷域ｧ繝√ぉ繝・け**: required contexts 讀懆ｨｼ |

## 柏 繧ｻ繧ｭ繝･繝ｪ繝・ぅ險ｭ險・
### 1. Fork PR 菫晁ｭｷ

```yaml
if: >
  github.event.pull_request.head.repo.full_name == github.repository
```

螟夜Κ繝輔か繝ｼ繧ｯ逕ｱ譚･縺ｮ PR 縺ｧ縺ｯ Secrets 縺碁愆蜃ｺ縺励↑縺・ｈ縺・～pull_request` 繝医Μ繧ｬ繝ｼ繧剃ｽｿ逕ｨ縺励・繝輔か繝ｼ繧ｯ逕ｱ譚･繧呈・遉ｺ逧・↓髯､螟悶＠縺ｦ縺・∪縺吶・
**蜿り・*: [GitHub Security Guides - Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### 2. 譛蟆乗ｨｩ髯・
```yaml
permissions:
  contents: write          # 繝槭・繧ｸ謫堺ｽ・  pull-requests: write     # PR 繧ｹ繝・・繧ｿ繧ｹ譖ｴ譁ｰ
  checks: read             # 繝√ぉ繝・け蜿ら・縺ｮ縺ｿ
```

**蜿り・*: [Automatic token authentication](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

### 3. 繝ｩ繝吶Ν繝吶・繧ｹ蛻ｶ蠕｡

- `ux-ready`: 譏守､ｺ逧・↑襍ｷ蜍包ｼ郁ｪ､菴懷虚髦ｲ豁｢・・- `no-auto-merge`: 莠ｺ髢薙・譛邨ょ愛譁ｭ繧貞ｰ企㍾

### 4. Concurrency 蛻ｶ蠕｡

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

PR 蜊倅ｽ阪〒謗剃ｻ門宛蠕｡縲∝､夐㍾繝槭・繧ｸ莠区腐繧帝亟豁｢縲・
**蜿り・*: [Using concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)

## 圜 驕狗畑繝昴Μ繧ｷ繝ｼ萓・
### 繝代ち繝ｼ繝ｳ1: 蜴ｳ譬ｼ驕狗畑

```yaml
# ux-ready 繝ｩ繝吶Ν蠢・・+ 繝ｬ繝薙Η繝ｼ謇ｿ隱榊ｿ・・if: >
  contains(..., 'ux-ready') &&
  !contains(..., 'no-auto-merge') &&
  github.event.pull_request.reviews_count > 0
```

### 繝代ち繝ｼ繝ｳ2: Dependabot 閾ｪ蜍募喧

```yaml
# dependabot PR縺ｯ閾ｪ蜍輔・繝ｼ繧ｸ・・inor/patch縺ｮ縺ｿ・・if: >
  github.actor == 'dependabot[bot]' &&
  contains(github.event.pull_request.title, 'bump') &&
  !contains(github.event.pull_request.title, 'major')
```

### 繝代ち繝ｼ繝ｳ3: Merge Queue 菴ｵ逕ｨ

Settings 竊・Branches 竊・main 縺ｧ Merge queue 繧呈怏蜉ｹ蛹悶☆繧九→縲・遶ｶ蜷医☆繧・PR 繧ょｮ牙・縺ｫ逶ｴ蛻怜喧縺励※繝槭・繧ｸ縺ｧ縺阪∪縺吶・
**蜿り・*: [Managing a merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)

## 当 髢｢騾｣繝峨く繝･繝｡繝ｳ繝・
- [Automatically merging a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)
- [GitHub CLI - gh pr merge](https://cli.github.com/manual/gh_pr_merge)
- [Branch protection API](https://docs.github.com/en/rest/branches/branch-protection)
- [Check Runs API](https://docs.github.com/en/rest/checks/runs)
- [GitHub Actions concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)

## 雌 Tips

### 螟ｱ謨励＠縺溘メ繧ｧ繝・け縺ｮ蜀榊ｮ溯｡・
```powershell
# 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ蜀榊ｮ溯｡・gh run rerun <run-id> --failed

# Check Suite 蜀阪Μ繧ｯ繧ｨ繧ｹ繝・Import-Module .\scripts\modules\CiUtils.psm1
Invoke-CheckSuiteRerequest -PrNumber 149 -AppSlug "github-actions"
```

### 繝ｩ繝吶Ν縺ｮ荳諡ｬ邂｡逅・
```powershell
# 隍・焚PR縺ｫux-ready繧剃ｻ倅ｸ・149,148,147 | ForEach-Object {
    gh pr edit $_ --add-label 'ux-ready'
}
```

### 螳壽悄逧・↑謨ｴ蜷域ｧ繝√ぉ繝・け・・cheduled workflow・・
```yaml
# .github/workflows/scheduled-validation.yml
on:
  schedule:
    - cron: '0 0 * * 0'  # 豈朱ｱ譌･譖・0:00

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: .\scripts\validate-branch-protection.ps1 -AutoFix
```

---

**Status**: 笨・Production Ready

**Last Updated**: 2025-01-12

**Maintained by**: DevOps Team

