# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is the marketing site + client portal + internal ops console for Display & Cell Pros LLC (D&CP), an electronics repair lab. It's a Next.js 15 App Router application — every former SPA "tab" is now a real route under `app/`, and the ~50-route Express backend that used to live in a single `server.ts` is now ~45 Next.js Route Handlers under `app/api/`.

This app was migrated from a Vite + Express SPA to Next.js; the migration is documented in git history (commits from "Phase 1: scaffold..." through "Phase 7: cleanup...").

## Commands

- `npm run dev` — start the dev server (`node scripts/dev-wrapper.js`, a thin wrapper around `next dev` that normalizes `--port`/`--host` CLI flags and defaults to `0.0.0.0:3000`)
- `npm run build` — `next build`
- `npm start` — `next start` (serve the production build from `npm run build`)
- `npm run lint` — type-check only (`tsc --noEmit`); there is no separate ESLint script wired up despite `eslint` being a devDependency
- `npm test` — run all Vitest tests (`vitest run`); no `vitest.config.ts` exists, so it uses Vitest defaults
- Run a single test file: `npx vitest run src/lib/pricing.test.ts`
- `npx tsx scripts/run-all-tests.ts` — a separate, manually-written assertion suite (not Vitest) for completion-calculator and supported-devices logic; run this too when touching `src/utils/completionCalculator.ts` or `src/data/supportedDevicesData.ts`

Other scripts under `scripts/` are one-off ops utilities (DB setup/connection checks, Shopify checks, token refresh, sitemap/icon generation, env sync) — read a script before running it, several expect AWS/DB/Shopify credentials.

## Architecture

### Routing: file-based, one route per former tab

`app/` is the App Router root. Each top-level page lives in its own route folder (`app/intake/page.tsx`, `app/booking/page.tsx`, `app/voice-ai/studio/page.tsx`, etc.) — there are ~20 of these plus the homepage at `app/page.tsx`. Every `page.tsx` is a thin **Server Component**: it exports `metadata` sourced from `src/lib/seo-metadata.ts` (`getRouteMetadata('routeKey')`) and renders either an existing `src/components/*.tsx` view directly, or a `src/views/*.tsx` wrapper when the view needs a client-side navigation callback (Server Components can't pass closures to Client Components as props — see below).

- `src/components/SiteHeader.tsx` / `SiteFooter.tsx` render the persistent nav/footer from `app/layout.tsx`, using `next/link` and `usePathname()` for active-route highlighting — there is no more `activeTab` state.
- `src/views/*.tsx` (`AboutView`, `AcademyView`, `BookingView`, `BoardDatabaseView`, `EnterpriseView`) are `"use client"` wrappers whose only job is calling `useRouter().push(...)` and passing it down as a prop to the real view component — this pattern exists because a route's `page.tsx` must stay a Server Component to export `metadata`.
- `src/lib/seo-metadata.ts` is the single source of truth for per-route `<title>`/description/OG tags (`ROUTE_META_MAP`, keyed by route, one entry per page) — this replaced a runtime `document.title`-mutating component from the Vite era.

### API: Next.js Route Handlers, grouped by original Express route

`app/api/**/route.ts` files each export named HTTP method functions (`GET`, `POST`, etc.) — there is no more single `server.ts` Express app. Route groups: `db/*` (Aurora health/metrics/admin), `auth/*` (Auth0 RBAC config, GitHub OAuth), `github/*` (webhook receiver + repo sync), `elevenlabs/*` (TTS, voice intake, agent proxy), `ai/*` (Gemini/OpenAI diagnostics), `stripe/*` + `checkout/*` (payments), `repair-status/*`, `client/orders`, `intake/sync`, `support/*`, `academy/generate-video`, `booking/schedule`. The GitHub OAuth popup callback lives outside `/api` at `app/auth/github/callback/route.ts` and `app/auth/callback/route.ts` (an alias) since it returns HTML, not JSON.

- Rate limiting: `aiRateLimiterNext` / `formRateLimiterNext` from `src/lib/serverSecurity.ts` — call `.check(req)` at the top of a handler; a non-null return is a ready-to-return 429 `NextResponse`.
- Request validation uses Zod schemas centralized in `src/lib/schemas.ts` (e.g. `DiagnoseSchema`, `SmartTriageSchema`, `BookingScheduleSchema`) — framework-agnostic, unchanged by the migration.
- `getOpenAI()` / `getGemini()` (lazy client getters) live in `src/lib/aiClients.ts`. `getStripe()` lives in `src/lib/stripe.ts`.
- Shared GitHub webhook/sync state (the in-memory `webhookEventsLog` FIFO buffer, signature verification, token lookup) lives in `src/lib/githubSync.ts` — same per-instance/best-effort in-memory caveat it had under Express; not durable across serverless invocations.
- Security headers (CSP etc.) are set globally via `next.config.js`'s `headers()`, not per-request middleware.
- Dynamic route params are async in this Next version — `{ params }: { params: Promise<{ ticketNumber: string }> }`, `await params` inside the handler.

### Database: dual Postgres access paths

- `src/lib/serverDb.ts` — server-only pooled `pg` access to AWS RDS Aurora Postgres, with IAM auth via `@aws-sdk/rds-signer` and a read-replica pool split (`getDatabasePool()` / read-only pool). Route Handlers dynamically `import('.../src/lib/serverDb.ts')` inside the handler body rather than importing at module top level.
- `prisma/schema.prisma` — Prisma models exist only for NextAuth-style `Account`/`Session`/`User`/`VerificationToken` tables; this is a narrower, separate concern from the hand-rolled `pg` pool.
- `src/lib/db.ts` — client-side/offline layer: local SQLite-backed offline storage interface and React hooks (`useDatabase`/`useOfflineDatabase`) for persisting repair intake drafts when offline, syncing later.
- Don't conflate these three — pick the one matching where the code runs (Route Handler vs. Prisma auth tables vs. browser offline storage).

### Third-party integrations

Each major integration gets its own `src/lib/*.ts` module plus one or more `src/components/*.tsx` UI surfaces:
- **Shopify**: `src/lib/shopify.ts` (storefront GraphQL fetch), `shopify-queries.ts`, `shopify-types.ts`, `src/lib/shopify/operations/`, cart logic in `cart-actions.ts`.
- **Auth0**: `src/lib/auth0.ts`, `auth0-mgmt.ts` (Management API), `auth0Rbac.ts`; UI in `Auth0FlowsHub.tsx`, `Auth0UserButton.tsx`, `Auth0RbacModal.tsx`, `Auth0TenantAuditReport.tsx`. `Auth0ProviderWithConfig.tsx` (mounted in `app/layout.tsx`) reads `NEXT_PUBLIC_AUTH0_DOMAIN`/`NEXT_PUBLIC_AUTH0_CLIENT_ID`/`NEXT_PUBLIC_AUTH0_AUDIENCE` and falls back to a no-op provider if unconfigured.
- **ElevenLabs** (voice AI): several `Eleven*` components (TTS generator, conversation flow, voice studio settings, agent inspector, knowledge/tools hub) plus `/api/elevenlabs/*` Route Handlers proxying the ElevenLabs API.
- **Stripe**: `src/lib/stripe.ts`, `StripeCheckoutComponent.tsx`/`StripeCheckoutModal.tsx`, Route Handlers under `/api/stripe/*` and `/api/checkout/*`. Client publishable key: `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`.
- **GitHub**: OAuth popup flow + webhook sync (`app/auth/**`, `app/api/github/**`) syncing SOPs/issues/commits/telemetry — internal ops integration, not customer-facing.
- **AWS**: RDS Aurora via `serverDb.ts`/`aurora.ts`, CloudFront via `cloudfront.ts`, Vercel OIDC credential flow (`awsCredentialsProvider`).
- **AI (repair diagnostics)**: `/api/ai/diagnose`, `/api/ai/smart-triage`, `/api/ai/diagnostic-path` use OpenAI and `@google/genai` (Gemini) with caching (`diagnosticCache`, `triageCache` from `serverSecurity.ts`) and timeouts (`withTimeout`).

### Client/server component boundaries

Nearly every component under `src/components/` starts with `"use client"` — this is a state-heavy, interaction-heavy app (forms, animations, WebUSB, camera/barcode capture, canvas), so client-by-default was the deliberate call during migration rather than auditing each file for server-component eligibility. A handful of purely presentational, hookless components (`AuthLoadingOverlay.tsx`, `UserProviderWrapper.tsx`, `VercelLoginButton.tsx`) were deliberately left as Server Components. `app/*/page.tsx` files themselves are Server Components (required for `metadata` export) that render Client Component views — see the `src/views/*.tsx` wrapper pattern above.

Static image imports (`src/assets/images/*`) return `{ src, width, height }` under Next's webpack loader, not a plain string like Vite — `src/utils/staticImage.ts`'s `staticImageSrc()` helper normalizes this for direct `<img src={...}>` usage (no `next/image` adoption forced).

### Frontend structure

- `src/components/` is a flat directory (100+ files) — component names are descriptive and self-namespacing (e.g. `Eleven*`, `Auth0*`, `Repair*`) rather than grouped into subfolders; grep by prefix to find related UI.
- `src/lib/pricing.ts`, `repair-logic.ts`, `constants.ts` hold repair-domain business logic (tiers, pricing) shared between client and server.
- `src/lib/schemas.ts` is the single source of truth for Zod request/response validation shapes shared by client forms and Route Handlers.
- Path alias `@/*` maps to both `src/*` and repo root (see `tsconfig.json`) — used inconsistently, check existing imports in a file before adding new ones.
- Client-exposed env vars use the `NEXT_PUBLIC_*` prefix (not Vite's `VITE_*`) — see `.env.example`.

### Testing

Vitest tests (`*.test.ts`) are colocated next to the source they test (not in a separate `__tests__` tree). Coverage is partial — most `src/lib/*.ts` and a few components/hooks. When adding logic to `pricing.ts`, `schemas.ts`, `completionCalculator.ts`, `db.ts`, or `useFounderAnimationSpeed.ts`, check for and update the adjacent `.test.ts` file.
