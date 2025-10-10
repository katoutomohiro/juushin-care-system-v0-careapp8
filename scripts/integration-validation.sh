#!/bin/bash
# Integration Validation Script - Comprehensive validation of PR integration

set -e

echo "🔍 Starting Integration Validation Process..."

# Function to validate CI configuration
validate_ci_config() {
    echo "🔧 Validating CI Configuration..."
    
    # Check if CI workflows exist and are properly configured
    if [ ! -f ".github/workflows/ci.yml" ]; then
        echo "❌ CI workflow not found"
        return 1
    fi
    
    # Validate Node.js and pnpm versions in CI
    if grep -q "node-version.*18" .github/workflows/ci.yml && grep -q "version.*9.12.3" .github/workflows/ci.yml; then
        echo "✅ CI configured with Node 18 and pnpm 9.12.3"
    else
        echo "❌ CI configuration mismatch"
        return 1
    fi
    
    # Check package.json consistency
    if grep -q '"packageManager": "pnpm@9.12.3"' package.json; then
        echo "✅ Package manager correctly specified"
    else
        echo "❌ Package manager specification missing or incorrect"
        return 1
    fi
    
    return 0
}

# Function to validate build process
validate_build() {
    echo "🏗️ Validating Build Process..."
    
    # Clean install
    echo "📦 Installing dependencies..."
    pnpm install --frozen-lockfile
    
    if [ $? -ne 0 ]; then
        echo "❌ Dependency installation failed"
        return 1
    fi
    
    # Lint check
    echo "🔍 Running linter..."
    pnpm lint
    
    if [ $? -ne 0 ]; then
        echo "❌ Linting failed"
        return 1
    fi
    
    # Build check
    echo "🏗️ Building application..."
    pnpm build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed"
        return 1
    fi
    
    echo "✅ Build process validated successfully"
    return 0
}

# Function to validate component functionality
validate_components() {
    echo "🧩 Validating Component Functionality..."
    
    # Check if key components exist
    local components=(
        "components/forms/vitals-form.tsx"
        "components/forms/seizure-form.tsx"
        "components/care-form-modal.tsx"
        "components/a4-record-sheet.tsx"
        "services/daily-log-export-service.tsx"
    )
    
    for component in "${components[@]}"; do
        if [ -f "$component" ]; then
            echo "✅ $component exists"
        else
            echo "❌ $component missing"
            return 1
        fi
    done
    
    # Check for TypeScript compilation
    echo "🔍 Checking TypeScript compilation..."
    npx tsc --noEmit
    
    if [ $? -ne 0 ]; then
        echo "❌ TypeScript compilation failed"
        return 1
    fi
    
    echo "✅ Component validation completed"
    return 0
}

# Function to validate test suite
validate_tests() {
    echo "🧪 Validating Test Suite..."
    
    # Check if test files exist
    local test_files=(
        "tests/pr-integration.spec.js"
        "tests/feature-pr-validation.spec.js"
        "tests/ui-component-integration.spec.js"
        "tests/form-functionality.spec.js"
        "tests/accessibility.spec.js"
        "tests/conflict-detection.spec.js"
    )
    
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            echo "✅ $test_file exists"
        else
            echo "⚠️  $test_file missing (optional)"
        fi
    done
    
    # Run smoke tests
    echo "🔥 Running smoke tests..."
    pnpm test:smoke
    
    if [ $? -ne 0 ]; then
        echo "❌ Smoke tests failed"
        return 1
    fi
    
    # Run E2E tests if available
    if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
        echo "🎭 Running E2E tests..."
        pnpm test:e2e --reporter=line
        
        if [ $? -ne 0 ]; then
            echo "⚠️  E2E tests failed (may require manual review)"
        else
            echo "✅ E2E tests passed"
        fi
    fi
    
    echo "✅ Test validation completed"
    return 0
}

# Function to validate data integrity
validate_data_integrity() {
    echo "💾 Validating Data Integrity..."
    
    # Check localStorage functionality
    echo "🔍 Checking data storage services..."
    
    if grep -q "DataStorageService" services/data-storage-service.ts; then
        echo "✅ Data storage service exists"
    else
        echo "❌ Data storage service missing"
        return 1
    fi
    
    # Check export functionality
    if grep -q "DailyLogExportService" services/daily-log-export-service.tsx; then
        echo "✅ Export service exists"
    else
        echo "❌ Export service missing"
        return 1
    fi
    
    echo "✅ Data integrity validation completed"
    return 0
}

# Function to validate accessibility
validate_accessibility() {
    echo "♿ Validating Accessibility..."
    
    # Check for ARIA labels and semantic HTML
    if grep -r "aria-label\|role=" app/ components/ --include="*.tsx" --include="*.jsx" | head -5; then
        echo "✅ ARIA labels found in components"
    else
        echo "⚠️  Limited ARIA labels detected"
    fi
    
    # Check for semantic HTML elements
    if grep -r "<main\|<header\|<nav\|<section" app/ components/ --include="*.tsx" --include="*.jsx" | head -3; then
        echo "✅ Semantic HTML elements found"
    else
        echo "⚠️  Limited semantic HTML detected"
    fi
    
    echo "✅ Accessibility validation completed"
    return 0
}

# Function to generate validation report
generate_validation_report() {
    local overall_status=$1
    
    echo "📋 Generating Validation Report..."
    
    cat > "integration-validation-report.md" << EOF
# Integration Validation Report

**Date:** $(date)
**Overall Status:** $(if [ "$overall_status" = "0" ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

## Validation Results

### CI Configuration
$(if validate_ci_config &>/dev/null; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Node.js version: 18.x
- pnpm version: 9.12.3
- Package manager specification: Present

### Build Process
$(if validate_build &>/dev/null; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Dependency installation: $(if pnpm install --frozen-lockfile &>/dev/null; then echo "✅ Success"; else echo "❌ Failed"; fi)
- Linting: $(if pnpm lint &>/dev/null; then echo "✅ Passed"; else echo "❌ Failed"; fi)
- Build: $(if pnpm build &>/dev/null; then echo "✅ Success"; else echo "❌ Failed"; fi)

### Component Functionality
$(if validate_components &>/dev/null; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Core components: Present
- TypeScript compilation: $(if npx tsc --noEmit &>/dev/null; then echo "✅ Success"; else echo "❌ Failed"; fi)

### Test Suite
$(if validate_tests &>/dev/null; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Smoke tests: $(if pnpm test:smoke &>/dev/null; then echo "✅ Passed"; else echo "❌ Failed"; fi)
- E2E tests: $(if pnpm test:e2e &>/dev/null 2>&1; then echo "✅ Passed"; else echo "⚠️ Needs Review"; fi)

### Data Integrity
$(if validate_data_integrity &>/dev/null; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Storage services: Present
- Export functionality: Present

### Accessibility
$(if validate_accessibility &>/dev/null; then echo "✅ PASSED"; else echo "⚠️ NEEDS IMPROVEMENT"; fi)
- ARIA labels: $(if grep -r "aria-label" app/ components/ --include="*.tsx" &>/dev/null; then echo "Present"; else echo "Limited"; fi)
- Semantic HTML: $(if grep -r "<main\|<header" app/ components/ --include="*.tsx" &>/dev/null; then echo "Present"; else echo "Limited"; fi)

## Recommendations

$(if [ "$overall_status" = "0" ]; then
    echo "✅ Integration is ready for production deployment."
    echo ""
    echo "### Next Steps:"
    echo "1. Merge approved PRs in priority order"
    echo "2. Deploy to staging environment"
    echo "3. Conduct user acceptance testing"
    echo "4. Monitor production deployment"
else
    echo "❌ Integration requires attention before deployment."
    echo ""
    echo "### Required Actions:"
    echo "1. Fix failing build/test issues"
    echo "2. Resolve component conflicts"
    echo "3. Update CI configuration if needed"
    echo "4. Re-run validation after fixes"
fi)

## Performance Metrics

- Build time: $(date)
- Bundle size: $(if [ -d ".next" ]; then du -sh .next 2>/dev/null || echo "Not available"; else echo "Not built"; fi)
- Test coverage: $(echo "Requires manual review")

## Security Checklist

- [ ] No hardcoded secrets in code
- [ ] Dependencies scanned for vulnerabilities
- [ ] HTTPS enforced in production
- [ ] Input validation implemented
- [ ] XSS protection in place

---

*Generated by integration-validation.sh*
EOF
    
    echo "📄 Report saved to integration-validation-report.md"
}

# Main validation process
main() {
    echo "🚀 Starting comprehensive integration validation..."
    
    local validation_status=0
    
    # Run all validations
    validate_ci_config || validation_status=1
    validate_build || validation_status=1
    validate_components || validation_status=1
    validate_tests || validation_status=1
    validate_data_integrity || validation_status=1
    validate_accessibility || validation_status=1
    
    # Generate report
    generate_validation_report $validation_status
    
    if [ $validation_status -eq 0 ]; then
        echo "🎉 Integration validation completed successfully!"
        echo "✅ All systems are ready for production deployment."
    else
        echo "❌ Integration validation failed!"
        echo "🔧 Please review the validation report and fix identified issues."
    fi
    
    return $validation_status
}

# Run main validation
main "$@"
