## Overview
Make `workflow_dispatch` runs of ai-dispatcher non-strict by default (warn-only), while keeping scheduled runs strict and failing when required secrets are missing.

## Changes
- Add `workflow_dispatch` input `strict` (boolean, default false)
- Add env flags for secrets presence (`HAS_OPENAI`, `HAS_SUPABASE_KEY`, `HAS_SUPABASE_URL`) and `STRICT`
- Add warn-only step for manual non-strict runs when secrets are missing
- Gate the Python ok-guard step to run only when `STRICT==true` or on `schedule`

## Behavior
- Manual run (workflow_dispatch):
  - Default non-strict: missing secrets produce warnings; job succeeds
  - With `strict: true`: behaves like scheduled audit (fails if secrets missing)
- Scheduled run: strict by design; fails if required secrets are missing

## Rationale
Reduces noise during manual tests while keeping nightly audit strict to catch misconfigurations. Aligns with WORKFLOW_BEST_PRACTICES.md guidance.
