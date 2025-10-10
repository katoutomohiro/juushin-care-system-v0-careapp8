#!/bin/bash
# Merge Conflict Resolution Script - Automated conflict detection and resolution

set -e

echo "🔧 Starting Merge Conflict Resolution Process..."

# Function to detect conflicts in a branch
detect_conflicts() {
    local pr_branch=$1
    local pr_number=$2
    
    echo "🔍 Checking for conflicts in PR #$pr_number ($pr_branch)"
    
    git fetch origin
    git checkout main
    git pull origin main
    
    # Try to merge and detect conflicts
    git checkout $pr_branch
    git merge origin/main --no-commit --no-ff 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo "❌ Conflicts detected in PR #$pr_number"
        git merge --abort
        return 1
    else
        echo "✅ No conflicts in PR #$pr_number"
        git reset --hard HEAD
        return 0
    fi
}

# Function to resolve common conflicts automatically
auto_resolve_conflicts() {
    local pr_branch=$1
    local pr_number=$2
    
    echo "🔧 Attempting auto-resolution for PR #$pr_number ($pr_branch)"
    
    git checkout $pr_branch
    git merge origin/main
    
    # Check for conflict markers
    if git diff --name-only --diff-filter=U | grep -q .; then
        echo "📝 Found conflicted files:"
        git diff --name-only --diff-filter=U
        
        # Auto-resolve package.json conflicts (prefer main branch for dependencies)
        if git diff --name-only --diff-filter=U | grep -q "package.json"; then
            echo "🔧 Auto-resolving package.json conflicts..."
            git checkout --theirs package.json
            git add package.json
        fi
        
        # Auto-resolve workflow conflicts (prefer main branch for CI)
        if git diff --name-only --diff-filter=U | grep -q ".github/workflows"; then
            echo "🔧 Auto-resolving workflow conflicts..."
            git diff --name-only --diff-filter=U | grep ".github/workflows" | while read file; do
                git checkout --theirs "$file"
                git add "$file"
            done
        fi
        
        # Check if all conflicts are resolved
        if ! git diff --name-only --diff-filter=U | grep -q .; then
            git commit -m "chore: resolve merge conflicts automatically"
            echo "✅ Auto-resolved conflicts in PR #$pr_number"
            return 0
        else
            echo "⚠️  Manual resolution required for remaining conflicts"
            git merge --abort
            return 1
        fi
    else
        echo "✅ No conflicts to resolve"
        return 0
    fi
}

# Function to create conflict resolution report
create_conflict_report() {
    local pr_branch=$1
    local pr_number=$2
    local status=$3
    
    echo "📋 Creating conflict report for PR #$pr_number"
    
    cat > "conflict-report-${pr_number}.md" << EOF
# Conflict Resolution Report - PR #${pr_number}

**Branch:** ${pr_branch}
**Status:** ${status}
**Date:** $(date)

## Conflict Analysis

$(if [ "$status" = "resolved" ]; then
    echo "✅ All conflicts have been automatically resolved."
    echo ""
    echo "### Auto-resolved files:"
    git log --oneline -1 --name-only | tail -n +2
else
    echo "❌ Manual resolution required."
    echo ""
    echo "### Conflicted files:"
    git diff --name-only --diff-filter=U 2>/dev/null || echo "Unable to determine conflicted files"
fi)

## Resolution Steps

$(if [ "$status" = "resolved" ]; then
    echo "1. Merged main branch into feature branch"
    echo "2. Auto-resolved package.json conflicts (preferred main branch dependencies)"
    echo "3. Auto-resolved workflow conflicts (preferred main branch CI configuration)"
    echo "4. Committed resolution"
else
    echo "1. Detected conflicts that require manual resolution"
    echo "2. Common conflict types:"
    echo "   - Component imports/exports"
    echo "   - TypeScript interface changes"
    echo "   - Styling conflicts"
    echo "3. Recommended approach:"
    echo "   - Review each conflict manually"
    echo "   - Test functionality after resolution"
    echo "   - Ensure no breaking changes"
fi)

## Next Steps

$(if [ "$status" = "resolved" ]; then
    echo "- Run tests to ensure functionality"
    echo "- Push resolved branch"
    echo "- Request review for merge"
else
    echo "- Manual conflict resolution required"
    echo "- Contact development team for assistance"
    echo "- Consider creating separate PR for complex conflicts"
fi)
EOF
    
    echo "📄 Report saved to conflict-report-${pr_number}.md"
}

# PRs that commonly have conflicts (based on analysis)
CONFLICT_PRONE_PRS=(
    "feature/vitals-unified-ui:149"
    "feature/seizure-quick-record:150"
    "feature/export-preview-ui:151"
    "feature/a4-display-improvements:152"
)

# Process each PR for conflicts
for pr_info in "${CONFLICT_PRONE_PRS[@]}"; do
    IFS=':' read -r branch number <<< "$pr_info"
    
    if git show-ref --verify --quiet refs/remotes/origin/$branch; then
        echo "🔍 Processing PR #$number: $branch"
        
        if detect_conflicts $branch $number; then
            echo "✅ No conflicts detected"
            create_conflict_report $branch $number "clean"
        else
            if auto_resolve_conflicts $branch $number; then
                echo "✅ Conflicts auto-resolved"
                create_conflict_report $branch $number "resolved"
            else
                echo "❌ Manual resolution required"
                create_conflict_report $branch $number "manual"
            fi
        fi
    else
        echo "⚠️  Branch $branch not found, skipping..."
    fi
    
    echo "---"
done

echo "🎉 Conflict resolution process completed!"
echo "📋 Check conflict-report-*.md files for detailed results"
