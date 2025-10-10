#!/bin/bash
# Feature PR Rebase Script - Automated rebase for UI/feature PRs

set -e

echo "🔄 Starting Feature PR Rebase Process..."

# Function to rebase feature PR against main
rebase_feature_pr() {
    local pr_branch=$1
    local pr_number=$2
    
    echo "🔄 Rebasing feature PR #$pr_number ($pr_branch)"
    
    # Fetch latest changes
    git fetch origin
    git checkout main
    git pull origin main
    
    # Switch to feature branch and rebase
    git checkout $pr_branch
    git rebase origin/main
    
    if [ $? -ne 0 ]; then
        echo "❌ Rebase conflicts detected in PR #$pr_number"
        echo "Manual resolution required for: $pr_branch"
        git rebase --abort
        return 1
    fi
    
    echo "✅ Successfully rebased PR #$pr_number"
    return 0
}

# Function to test feature PR
test_feature_pr() {
    local pr_branch=$1
    local pr_number=$2
    
    echo "🧪 Testing feature PR #$pr_number ($pr_branch)"
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    # Run linting
    pnpm lint
    
    # Build the application
    pnpm build
    
    # Run smoke tests
    pnpm test:smoke
    
    # Run E2E tests if available
    if [ -f "playwright.config.ts" ]; then
        pnpm test:e2e
    fi
    
    echo "✅ All tests passed for PR #$pr_number"
}

# Feature PRs to rebase (based on analysis)
FEATURE_PRS=(
    "feature/vitals-unified-ui:149"
    "feature/seizure-quick-record:150"
    "feature/export-preview-ui:151"
    "feature/a4-display-improvements:152"
)

# Process feature PRs
for pr_info in "${FEATURE_PRS[@]}"; do
    IFS=':' read -r branch number <<< "$pr_info"
    
    if git show-ref --verify --quiet refs/remotes/origin/$branch; then
        echo "📋 Processing PR #$number: $branch"
        
        if rebase_feature_pr $branch $number; then
            if test_feature_pr $branch $number; then
                echo "✅ PR #$number is ready for integration"
            else
                echo "❌ PR #$number failed tests after rebase"
            fi
        else
            echo "⚠️  PR #$number requires manual conflict resolution"
        fi
    else
        echo "⚠️  Branch $branch not found, skipping..."
    fi
    
    echo "---"
done

echo "🎉 Feature PR rebase process completed!"
