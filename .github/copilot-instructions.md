# AI Copilot Instructions - 重心ケア支援アプリ

**Project**: Juushin Care System v0 (Next.js PWA for medical care records)  
**Status**: Production (PWA + API routes, Supabase integration in progress)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix components)
- **Data Layer**: Browser localStorage (primary) + Supabase (planned integration)
- **PWA**: Service Worker + offline support (IndexedDB for offline drafts)
- **Testing**: Vitest + Playwright + Testing Library + Storybook

### Data Flow
1. **Daily Care Records** → Local state → localStorage (DataStorageService)
2. **Offline Support**: IndexedDB stores drafts when offline; sync to Supabase when online
3. **A4 Record Sheets**: In-memory composition from daily events, PDF export via @react-pdf/renderer
4. **File Storage**: Vercel Blob (images/attachments) + Supabase (case records metadata)

## Key Files & Patterns

### Route Structure (App Router)
- **`app/page.tsx`**: Main dashboard with welfare services menu
- **`app/services/[serviceId]/users/[userId]/page.tsx`**: User profile + A4 record preview
- **`app/services/[serviceId]/users/[userId]/case-records/page.tsx`**: Case record form & grid
- **`app/api/{resource}/route.ts`**: API handlers (use `await context.params` for Next.js 15)

### Core Services
- **`services/data-storage-service.ts`**: CRUD wrapper for localStorage + indexedDB (brand-new-user UX)
- **`lib/persistence/seizure.ts`**: Supabase-first fallback pattern (try Supabase, catch → localStorage)
- **`services/a4-mapping.ts`**: Composes A4Record from daily events (transport, vitals, intake, etc.)
- **`lib/offline/`**: IndexedDB layer for offline-first case record drafts

### Feature Flags
- **`config/features.ts`**: Centralized flags (timeline, pushNotifications, caseRecordExcelInput, preloadCaseRecordMetaOnProfile)
- **Pattern**: `if (!FEATURES.featureName) return null` for component guards
- **User-specific**: `userId === AT_USER_ID` for A.T. service fallback logic

## Critical Conventions

### 1. **Error Handling in API Routes**
```typescript
// ✅ Correct: Must always return Response
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params  // Next.js 15: params is Promise
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Endpoint failed:', error)
    return NextResponse.json({ error: 'reason' }, { status: 500 })
  }
}
// ❌ Wrong: Response.next() is not allowed in Route Handlers
```

### 2. **Offline-First Data Persistence**
- **Priority**: Supabase → IndexedDB → localStorage
- **Pattern**: Catch Supabase errors and write to IndexedDB; sync when online
- **Client Guards**: `typeof window !== 'undefined'` before localStorage access
- **Sync Hooks**: useOnlineStatus detects network changes; triggers background sync

### 3. **Form Validation & Types**
- **Schema**: Zod for runtime + TypeScript types
- **Example**: CareEvent has strict shape (id, userId, eventType, timestamp, data)
- **Validation**: Always validate before localStorage.setItem() to prevent serialization errors

### 4. **React Hooks - Dependencies & Early Returns**
- **Rule**: All hooks declared before any early returns
- **Problem**: useEffect with `[userId, toast]` causes infinite fetch loops if toast is redefined
- **Solution**: Use `useRef` for one-time initialization (didFetchRef.current = true)
- **useRouter/useParams**: Extract in component body, not in useEffect

### 5. **A4 Record Composition**
```typescript
// services/a4-mapping.ts pattern
export function composeA4Record(params: {
  userId: string; date: string;
  transport: TransportEvent[];    // Sorted by timestamp
  vitals: VitalEntry[];            // Pick morning/noon/evening
  ...
}): A4Record
```
- All event arrays come pre-sorted by timestamp
- A4Record header includes userId, date, serviceType, staffIds
- PDF export in components/a4-record-sheet.tsx uses @react-pdf/renderer

## Testing & Build

### Essential Commands
```powershell
pnpm lint                    # ESLint (exhaustive-deps, react-hooks)
pnpm typecheck              # tsc --noEmit (must pass before commit)
pnpm build                  # Next.js production build
pnpm test                   # Vitest (unit tests)
pnpm test:watch             # Vitest watch mode
pnpm test:e2e               # Playwright (Chromium only, unless test:e2e:all)
pnpm ai:snapshot            # Generate docs/SNAPSHOT.md (run before new AI session)
```

### Preflight/Postflight (Before Submitting PR)
1. **Before Changes**: Run `pnpm lint > logs/before-lint.txt && pnpm typecheck > logs/before-typecheck.txt`
2. **After Changes**: Run same commands again → compare error counts
3. **Rule**: Never increase error/warning count (new errors forbidden)
4. **Acceptance**: `typecheck` errors reduced or unchanged; lint warnings stable

## Project-Specific Gotchas

### 1. **Supabase Params in Route Handlers**
Next.js 15 changed params from object to Promise. Always use:
```typescript
const params = await context.params
const { userId } = params
```

### 2. **A.T. Service Fallback**
Users with service type "A.T." fall back to hardcoded staff options (AT_STAFF_FALLBACK_OPTIONS). Check [app/services/[serviceId]/users/[userId]/case-records/page.tsx](app/services/[serviceId]/users/[userId]/case-records/page.tsx) before modifying staff selection logic.

### 3. **localStorage Serialization**
Only store JSON-serializable objects. Complex types (Date, functions) must be converted:
```typescript
// ✅ Correct
const log = { ...event, ts: event.ts.toISOString() }
localStorage.setItem('log', JSON.stringify(log))

// ❌ Wrong
localStorage.setItem('event', JSON.stringify(event))  // Date not serializable
```

### 4. **ClickableCard particleColors Prop**
PropertyValue must be `string[]` or undefined. Do not pass objects or mixed types.

### 5. **Offline Outbox Pattern**
IndexedDB tables: case_record_drafts, offline_op_receipts. Avoid direct table access; use lib/offline utilities for sync logic.

## Documentation Sources

- **Architecture**: [TECHNICAL_ARCHITECTURE.md](../TECHNICAL_ARCHITECTURE.md)
- **Current Status**: [AI_CONTEXT.md](../docs/AI_CONTEXT.md)
- **Collaboration Guide**: [ai-collaboration-handbook.md](../docs/ai-collaboration-handbook.md)
- **Validation Steps**: [PREFLIGHT.md](../docs/PREFLIGHT.md)
- **Offline Sync Design**: [OFFLINE_OUTBOX.md](../docs/OFFLINE_OUTBOX.md)

## When Starting a New Task

1. **Confirm Current State**: Run `pnpm ai:snapshot` → share output
2. **Check Priority**: Review [ai-collaboration-handbook.md](../docs/ai-collaboration-handbook.md) Section 4 (Priority Task List)
3. **Preserve Quality**: Compare lint/typecheck before → after; never increase error count
4. **Feature Flags First**: Use FEATURES.* or userId checks for risky changes
5. **Test Offline**: For data persistence, test with DevTools Network → Offline mode
