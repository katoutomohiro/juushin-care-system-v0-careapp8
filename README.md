# Juushin Care System

Next.js 15 + Supabase PWA for daily care records with offline-first local storage and A4 record exports.

## Overview

- Offline-first case records (localStorage/IndexedDB) with future Supabase sync
- App Router with authenticated routes enforced by middleware
- A4 record composition and PDF export via @react-pdf/renderer
- UI built with Tailwind CSS v4 and shadcn/ui (Radix primitives)

## Quick Start (Local)

```powershell
pnpm install
pnpm run reboot   # port free + clean + dev server
```

Then open http://localhost:3000 and log in with the seeded Supabase users.

## Environment Variables

Create `.env.local` (or set in Vercel) with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # required for server-side admin ops
ALLOW_REAL_PII=false            # disable real-name input (server)
NEXT_PUBLIC_ALLOW_REAL_PII=false # disable real-name input (client)
```

The app reads `NEXT_PUBLIC_*` on both client and server. `SUPABASE_SERVICE_ROLE_KEY` is only for server code that needs admin queries.

## Scripts

- `pnpm run reboot` – free port 3000, clear .next, start dev server
- `pnpm dev` – start dev server
- `pnpm lint` – ESLint
- `pnpm typecheck` – tsc --noEmit
- `pnpm build` – production build
- `pnpm test` – Vitest unit tests
- `pnpm test:e2e` – Playwright (Chromium)

## Deployment (Vercel)

1) Set env vars in Vercel Project Settings → Environment Variables (Production and Preview):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

2) Deploy

```powershell
pnpm install -g vercel
vercel --prod
```

3) Post-deploy checks
- /login redirects unauthenticated visitors
- Login with seeded staff account → /services/[serviceId]/users renders facility-scoped users (24 total across facilities)
- API routes return data without CORS/auth errors

## Docs

- Collaboration workflow: [docs/ai-collaboration-handbook.md](docs/ai-collaboration-handbook.md)
- Production readiness summary: [PRODUCTION_READY.md](PRODUCTION_READY.md)
- Production checklist: [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md)
- RLS details: [docs/SUPABASE_RLS_GUIDE.md](docs/SUPABASE_RLS_GUIDE.md)
- Records Analytics API: [docs/RECORDS_API_PR_SUMMARY.md](docs/RECORDS_API_PR_SUMMARY.md)

## Key Features

### Records Analytics (`/analytics`)
- **URL**: `/analytics` (accessible only when logged in)
- **Purpose**: ケア記録の期間別集計と分析
- **UI**: Summary cards (発作数, 睡眠時間, 食事完了数) + Daily data table
- **Access**: ダッシュボードの「試験機能 / AI支援セクション」から「Records Analytics」カードをクリック、またはURL直接入力
- **Authentication**: 未ログイン時は自動的に `/login` へリダイレクト
