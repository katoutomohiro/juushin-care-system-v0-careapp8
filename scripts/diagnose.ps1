# scripts/diagnose.ps1
$ErrorActionPreference = 'Stop'
$root = git rev-parse --show-toplevel
$files = @(
  ".github/dependabot.yml",
  ".github/workflows/openai-smoketest.yml",
  ".github/workflows/coverage.yml",
  ".github/workflows/snyk.yml",
  ".github/workflows/sonar.yml",
  ".github/workflows/ai-review.yml",
  "sonar-project.properties"
)
foreach ($f in $files) {
  $p = Join-Path $root $f
  if (Test-Path $p) {
    "{0} : {1} bytes" -f $f, (Get-Item $p).Length
  } else {
    "{0} : MISSING" -f $f
  }
}
