# Conflict Resolution Guide

## Overview

This guide provides step-by-step instructions for resolving merge conflicts in the Soul Care System project during PR integration.

## Common Conflict Types

### 1. Package.json Conflicts

**Symptoms:**
- Dependency version mismatches
- Script conflicts
- Engine specification differences

**Resolution:**
\`\`\`bash
# Prefer main branch for core dependencies
git checkout --theirs package.json

# For feature-specific dependencies, merge manually
# Review each dependency and choose appropriate version
\`\`\`

### 2. Component Import/Export Conflicts

**Symptoms:**
- Duplicate component definitions
- Import path conflicts
- TypeScript interface mismatches

**Resolution:**
\`\`\`bash
# Check for duplicate exports
grep -r "export.*ComponentName" src/

# Resolve by consolidating or renaming
# Update import paths consistently
\`\`\`

### 3. Styling Conflicts

**Symptoms:**
- CSS class conflicts
- Tailwind class overrides
- Component styling inconsistencies

**Resolution:**
- Use semantic class names
- Follow established color/spacing patterns
- Test responsive behavior after resolution

### 4. Workflow/CI Conflicts

**Symptoms:**
- GitHub Actions workflow differences
- CI configuration mismatches
- Environment variable conflicts

**Resolution:**
\`\`\`bash
# Always prefer main branch for CI configuration
git checkout --theirs .github/workflows/

# Verify CI passes after resolution
pnpm test:smoke
\`\`\`

## Automated Resolution Process

### Step 1: Detection
\`\`\`bash
# Run conflict detection
bash scripts/conflict-resolution.sh
\`\`\`

### Step 2: Auto-Resolution
The script automatically resolves:
- Package.json dependency conflicts
- Workflow configuration conflicts
- Simple import path conflicts

### Step 3: Manual Resolution
For complex conflicts:
1. Review conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. Understand both changes
3. Merge functionality appropriately
4. Test thoroughly

## Testing After Resolution

### Required Tests
\`\`\`bash
# Build test
pnpm build

# Lint test
pnpm lint

# Smoke test
pnpm test:smoke

# E2E test
pnpm test:e2e
\`\`\`

### UI Testing
- Test all affected components
- Verify form functionality
- Check responsive design
- Validate accessibility

## Prevention Strategies

### 1. Regular Rebasing
\`\`\`bash
# Rebase feature branches regularly
git checkout feature-branch
git rebase main
\`\`\`

### 2. Small, Focused PRs
- Keep PRs focused on single features
- Avoid large refactoring in feature PRs
- Separate UI and logic changes

### 3. Communication
- Coordinate with team on shared components
- Use draft PRs for work-in-progress
- Review dependencies before adding

## Escalation Process

### When to Escalate
- Complex business logic conflicts
- Breaking changes detected
- Multiple file conflicts across components

### How to Escalate
1. Create detailed conflict report
2. Tag relevant team members
3. Schedule conflict resolution session
4. Document resolution for future reference

## Tools and Resources

### Git Commands
\`\`\`bash
# View conflict status
git status

# View conflicted files
git diff --name-only --diff-filter=U

# Abort merge if needed
git merge --abort

# Continue after resolution
git add .
git commit -m "resolve: merge conflicts"
\`\`\`

### IDE Tools
- VS Code Git integration
- GitLens extension
- Merge conflict resolver

### Testing Tools
- Playwright for E2E testing
- Jest for unit testing
- Lighthouse for performance testing
