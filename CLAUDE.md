# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is the marketing site + client portal + internal ops console for Display & Cell Pros LLC (D&CP), an electronics repair lab. It's a single-page React app (`src/App.tsx` is a large tab-switcher, not a router — each "page" is a lazy-loaded component swapped into `activeTab` state) backed by one large Express server (`server.ts`) that is deployed both as a long-running Node server and as a Vercel serverless function.

## Commands

- `npm run dev` — start the dev server (`tsx server.ts`; Express + Vite middleware mode on port 3000)
- `npm run build` — Vite client build + esbuild bundle of `server.ts` into `dist/server.cjs`
- `npm start` — run the built server (`node dist/server.cjs`)
- `npm run lint` — type-check only (`tsc --noEmit`); there is no separate ESLint script wired up despite `eslint` being a devDependency
- `npm test` — run all Vitest tests (`vitest run`); no `vitest.config.ts` exists, so it uses Vitest defaults
- Run a single test file: `npx vitest run src/lib/pricing.test.ts`
- `npx tsx scripts/run-all-tests.ts` — a separate, manually-written assertion suite (not Vitest) for completion-calculator and supported-devices logic; run this too when touching `src/utils/completionCalculator.ts` or `src/data/supportedDevicesData.ts`

Other scripts under `scripts/` are one-off ops utilities (DB setup/connection checks, Shopify checks, token refresh, sitemap/icon generation, env sync) — read a script before running it, several expect AWS/DB/Shopify credentials.

## Architecture

### Server: one Express app, two runtimes

`server.ts` (~3300 lines) defines the entire backend as routes on a single `express()` app exported as `app`. There is no router-per-feature split — all `/api/*` routes live in this one file (AI diagnostics, Auth0/GitHub OAuth, Shopify checkout, Stripe, ElevenLabs voice, repair-status tracking, booking, DB admin/health endpoints, etc.).

- **Local/VM dev & prod**: `startServer()` at the bottom of `server.ts` only runs when `process.env.VERCEL` is unset. In dev it mounts Vite in middleware mode for HMR; in prod (non-Vercel) it serves the built `dist/` and falls back to `index.html` for SPA routing.
- **Vercel serverless**: `api/index.ts` just does `export default app` from `server.ts` — Vercel treats the whole Express app as one function per `vercel.json`'s rewrite of `/api/(.*)` → `/api/index`. `app.listen()` is skipped on Vercel; the platform invokes the exported app directly.
- All `/api/*` routes get a catch-all JSON 404 and a global JSON error handler at the end of the route list — new routes should be added before these.
- Rate limiting: `aiRateLimiter` (AI endpoints) and `formRateLimiter` (form submissions) from `src/lib/serverSecurity.ts`, applied per-route.
- Request validation uses Zod schemas centralized in `src/lib/schemas.ts` (e.g. `DiagnoseSchema`, `SmartTriageSchema`, `BookingScheduleSchema`).

### Database: dual Postgres access paths

- `src/lib/serverDb.ts` — server-only pooled `pg` access to AWS RDS Aurora Postgres, with IAM auth via `@aws-sdk/rds-signer` and a read-replica pool split (`getDatabasePool()` / read-only pool). This is what `server.ts` route handlers use directly (dynamic `import('./src/lib/serverDb.ts')` inside handlers, not top-level import).
- `prisma/schema.prisma` — Prisma models exist only for NextAuth-style `Account`/`Session`/`User`/`VerificationToken` tables; this is a narrower, separate concern from the hand-rolled `pg` pool.
- `src/lib/db.ts` — client-side/offline layer: local SQLite-backed offline storage interface and React hooks (`useDatabase`/`useOfflineDatabase`) for persisting repair intake drafts when offline, syncing later.
- Don't conflate these three — pick the one matching where the code runs (server route vs. Prisma auth tables vs. browser offline storage).

### Third-party integrations

Each major integration gets its own `src/lib/*.ts` module plus one or more `src/components/*.tsx` UI surfaces:
- **Shopify**: `src/lib/shopify.ts` (storefront GraphQL fetch), `shopify-queries.ts`, `shopify-types.ts`, `src/lib/shopify/operations/`, cart logic in `cart-actions.ts`.
- **Auth0**: `src/lib/auth0.ts`, `auth0-mgmt.ts` (Management API), `auth0Rbac.ts`; UI in `Auth0FlowsHub.tsx`, `Auth0UserButton.tsx`, `Auth0RbacModal.tsx`, `Auth0TenantAuditReport.tsx`.
- **ElevenLabs** (voice AI): several `Eleven*` components (TTS generator, conversation flow, voice studio settings, agent inspector, knowledge/tools hub) plus `/api/elevenlabs/*` server routes proxying the ElevenLabs API.
- **Stripe**: `src/lib/stripe.ts`, `StripeCheckoutComponent.tsx`/`StripeCheckoutModal.tsx`, server routes under `/api/stripe/*` and `/api/checkout/*`.
- **GitHub**: OAuth flow + webhook sync routes in `server.ts` (`/auth/github/callback`, `/api/github/webhooks/*`, `/api/github/sync/*`) syncing SOPs/issues/commits/telemetry — this is an internal ops integration, not customer-facing.
- **AWS**: RDS Aurora via `serverDb.ts`/`aurora.ts`, CloudFront via `cloudfront.ts`, Vercel OIDC credential flow (`awsCredentialsProvider`).
- **AI (repair diagnostics)**: `/api/ai/diagnose`, `/api/ai/smart-triage`, `/api/ai/diagnostic-path` routes use OpenAI and `@google/genai` (Gemini) with caching (`diagnosticCache`, `triageCache` from `serverSecurity.ts`) and timeouts (`withTimeout`).

### Frontend structure

- `src/App.tsx` owns a single `activeTab` union-typed state driving which top-level view renders — there is no client-side router. Most views are `React.lazy`-loaded via `lazyWithRetry` (`src/utils/lazyRetry.ts`) for resilient chunk loading.
- `src/components/` is a flat directory (100+ files) — component names are descriptive and self-namespacing (e.g. `Eleven*`, `Auth0*`, `Repair*`) rather than grouped into subfolders; grep by prefix to find related UI.
- `src/lib/pricing.ts`, `repair-logic.ts`, `constants.ts` hold repair-domain business logic (tiers, pricing) shared between client and server.
- `src/lib/schemas.ts` is the single source of truth for Zod request/response validation shapes shared by client forms and server routes.
- Path alias `@/*` maps to both `src/*` and repo root (see `tsconfig.json`) — used inconsistently, check existing imports in a file before adding new ones.

### Testing

Vitest tests (`*.test.ts`) are colocated next to the source they test (not in a separate `__tests__` tree). Coverage is partial — most `src/lib/*.ts` and a few components/hooks. When adding logic to `pricing.ts`, `schemas.ts`, `completionCalculator.ts`, `db.ts`, or `useFounderAnimationSpeed.ts`, check for and update the adjacent `.test.ts` file.
