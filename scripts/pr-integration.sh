#!/bin/bash
# PR Integration Script - Automated rebase and testing for stalled PRs

set -e

echo "🔄 Starting PR Integration Process..."

# Function to check CI status
check_ci_status() {
    echo "✅ Checking CI status..."
    pnpm install --frozen-lockfile
    pnpm lint
    pnpm build
    pnpm test:smoke
    echo "✅ CI checks passed"
}

# Function to rebase PR
rebase_pr() {
    local pr_branch=$1
    echo "🔄 Rebasing PR branch: $pr_branch"
    
    git fetch origin
    git checkout $pr_branch
    git rebase origin/main
    
    if [ $? -ne 0 ]; then
        echo "❌ Rebase conflicts detected. Manual resolution required."
        exit 1
    fi
    
    echo "✅ Rebase completed successfully"
}

# Function to test PR
test_pr() {
    local pr_branch=$1
    echo "🧪 Testing PR branch: $pr_branch"
    
    check_ci_status
    
    # Run additional PR-specific tests
    if [ -f "tests/pr-specific.spec.js" ]; then
        npx playwright test tests/pr-specific.spec.js
    fi
    
    echo "✅ PR tests passed"
}

# Main integration function
integrate_pr() {
    local pr_branch=$1
    local pr_number=$2
    
    echo "🚀 Integrating PR #$pr_number ($pr_branch)"
    
    rebase_pr $pr_branch
    test_pr $pr_branch
    
    echo "✅ PR #$pr_number ready for merge"
}

# Priority PR list (based on analysis)
PRIORITY_PRS=(
    "fix/ci-unify-node18-pnpm9123:148"
    "feature/vitals-unified-ui:149"
    "feature/seizure-quick-record:150"
    "feature/export-preview-ui:151"
)

# Process PRs in priority order
for pr_info in "${PRIORITY_PRS[@]}"; do
    IFS=':' read -r branch number <<< "$pr_info"
    if git show-ref --verify --quiet refs/remotes/origin/$branch; then
        integrate_pr $branch $number
    else
        echo "⚠️  Branch $branch not found, skipping..."
    fi
done

echo "🎉 PR integration process completed!"
