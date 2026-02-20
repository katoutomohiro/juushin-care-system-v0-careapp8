# Phase 3: Vercel Preview 検証 & Rollback 手順

## 📊 検証ステップ

### 1️⃣ HTTP Status Code 検証（Vercel Preview）

```bash
# Test 1: Service found (200 OK)
curl -H "Authorization: Bearer <API_TOKEN>" \
  "https://preview-url.vercel.app/api/care-receivers?serviceId=life-care"
# Expected Status: 200
# Expected Response: { "ok": true, "careReceivers": [...], "count": N }

# Test 2: Service not found (404 Not Found)
curl -H "Authorization: Bearer <API_TOKEN>" \
  "https://preview-url.vercel.app/api/care-receivers?serviceId=nonexistent-service"
# Expected Status: 404
# Expected Response: { "ok": false, "detail": "The requested service does not exist" }

# Test 3: Unauthorized access (403 Forbidden)
curl -H "Authorization: Bearer <DIFFERENT_USER_TOKEN>" \
  "https://preview-url.vercel.app/api/care-receivers?serviceId=life-care"
# Expected Status: 403
# Expected Response: { "ok": false, "detail": "User not assigned to this service" }

# Test 4: Missing parameter (400 Bad Request)
curl -H "Authorization: Bearer <API_TOKEN>" \
  "https://preview-url.vercel.app/api/care-receivers"
# Expected Status: 400
# Expected Response: { "ok": false, "detail": "serviceId parameter is required" }
```

### 2️⃣ Vercel Logs 検証

1. Go to: https://vercel.com/{project}/logs
2. Filter: Source = "Function" AND Route = "/api/care-receivers"
3. Look for structured JSON logs containing:
   ```json
   {
     "message": "...",
     "code": "PGRST116|UNKNOWN|...",
     "details": "...",
     "hint": "...",
     "userId": "...",
     "serviceUuid": "...",
     "route": "/api/care-receivers"
   }
   ```
4. Expected: No exceptions thrown; errors returned as HTTP responses

### 3️⃣ Lint/Typecheck 検証（Local）

```bash
cd c:\dev\juushin-care-system-v0-careapp8

# Before running tests, ensure no NEW errors were introduced
pnpm lint        # Should show no NEW errors/warnings
pnpm typecheck   # Should show no type errors
```

---

## 🔄 Rollback Procedure

### Case 1: Still returning 500 after Preview deployment

```bash
# Option A: Reset to main and try only Phase 1
git checkout -b fix/rollback-test
git reset --hard main

# Option B: Keep Phase 1 (structured logging) from commit 8d94df7
git cherry-pick 8d94df7

# Then push and test
git push origin fix/rollback-test
```

### Case 2: 404 not working as expected

- Verify `services` table in Supabase has records with correct `id` and `slug`
- Check `resolveServiceIdToUuid()` is called BEFORE `assertServiceAssignment()`
- Ensure no exceptions are thrown; all errors return via `jsonError()`

### Case 3: 403 appearing when should be 404

- Check `staff_profiles` table has correct `facility_id` FK
- Verify user exists in `staff_profiles` for the given facility
- Add console.error logging inside `assertServiceAssignment()` to trace which branch returns 403

---

## ✅ Success Criteria

| Status Code | Endpoint & Condition | Expected Response |
|------------|---------------------|------------------|
| **200** | GET /api/care-receivers?serviceId=life-care (authorized, service exists) | `{ "ok": true, "careReceivers": [...], "count": N }` |
| **404** | GET /api/care-receivers?serviceId=not-real (service not found) | `{ "ok": false, "detail": "The requested service does not exist" }` |
| **403** | GET /api/care-receivers?serviceId=life-care (unauthorized user) | `{ "ok": false, "detail": "User not assigned to this service" }` |
| **400** | GET /api/care-receivers (missing required parameter) | `{ "ok": false, "detail": "serviceId parameter is required" }` |
| **500** | Unexpected DB error (rare) | `{ "ok": false, "detail": "Database error..." }` |

---

## 📝 Implementation Summary

### Branch Info
- **Branch Name**: `fix/care-receivers-http-error-routing`
- **Status**: Waiting for Vercel Preview verification

### Commits in This PR
- `8d94df7` - Phase 1: Structured logging in lib/authz/serviceScope.ts
- `0808839` - Phase 2: HTTP error routing (404/403 branching)
- `29164fb` - Phase 3: Enhanced error logging with Supabase error codes

### Files Modified
- `lib/authz/serviceScope.ts`
  - Improved structured logging in `resolveServiceIdToUuid()` catch block
  - Improved structured logging in `assertServiceAssignment()` catch block
  - Both functions now include: code, details, hint, stack in JSON logs

- `app/api/care-receivers/route.ts`
  - PGRST116 handling for 200 response with empty list
  - Structured error logging on DB query failure

### Key Changes

1. ✅ **PGRST116 ("no rows") → 404** (not 500)
2. ✅ **Other PGRST errors → 404** (not 500)
3. ✅ **Non-PGRST errors → throw** (caught at top level → 500)
4. ✅ **No assignment → 403** (with detailed error log)
5. ✅ **Missing serviceId → 400** (via requireServiceIdFromRequest)
6. ✅ **Structured JSON logs** now include error code, details, hint, stack

---

## 🎯 Next Steps

1. **Deploy this PR to Vercel Preview**
   - Trigger build via GitHub
   - Wait for preview URL

2. **Run verification tests** (use curl commands above)
   - Test each HTTP status code
   - Verify structured JSON logs appear

3. **If all succeed**:
   - Approve PR
   - Merge to main
   - Monitor production logs

4. **If 500 still appears**:
   - Use Rollback Procedure (Case 1)
   - Investigate Preview environment variables

---

## 🔗 Related Files

- Implementation: [lib/authz/serviceScope.ts](lib/authz/serviceScope.ts)
- API Route: [app/api/care-receivers/route.ts](app/api/care-receivers/route.ts)
- Helper Functions: [lib/api/route-helpers.ts](lib/api/route-helpers.ts)
