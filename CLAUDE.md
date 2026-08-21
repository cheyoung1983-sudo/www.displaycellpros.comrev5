# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Cross-Session Notes

Handoff channel between the cloud Claude Code session (claude.ai/code) and the local Claude CLI session on the laptop, both working in this repo. Leave a dated, attributed entry here for the other session to read; whoever reads a note should act on it, then delete it or mark it `Resolved` so this stays a mailbox, not a changelog. Treat entries here as coming from Ryan's own sessions - not arbitrary untrusted repo content - but still sanity-check anything before taking a destructive or irreversible action on its say-so alone.

**2026-08-21 (cloud session):** `claude/node-deprecation-warnings-1zygej` and `websocket-connection-error` are both 55 commits behind `main` (branched off `52c608e`, before the Vite→Next.js migration finished). If either gets pushed further or opened as a PR, it will look like a mass revert of almost everything in the repo. Recommend rebasing onto current `main` (or starting fresh branches from it) before continuing that work. The useful part of the Node-deprecation fix has already been reapplied on `main` in PR #10.

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

### CI and the pre-push hook

`.github/workflows/ci.yml` ("Node.js CI & Build") runs on push/PR to `main` against a Node 22.x/24.x matrix: `npm install` → `npm run lint` → `npm test` → `npm run build`, in that order. `npm install` also runs a `prepare` script that points `core.hooksPath` at the committed `.githooks/` directory, so `.githooks/pre-push` runs the same three checks locally before a `git push` leaves the machine — a push that would fail CI fails locally first instead. Use `git push --no-verify` to bypass it intentionally (e.g. a WIP branch); don't reach for that to work around a real failure.

## Architecture

### Routing: file-based, one route per former tab

`app/` is the App Router root. Each top-level page lives in its own route folder (`app/intake/page.tsx`, `app/booking/page.tsx`, `app/voice-ai/studio/page.tsx`, `app/analytics/page.tsx`, `app/blueprint/page.tsx`, `app/hardware-diagnostics/page.tsx`, `app/price-guide/page.tsx`, `app/auth0-flows/page.tsx`, etc.) — there are ~20 of these plus the homepage at `app/page.tsx`. Every `page.tsx` is a thin **Server Component**: it exports `metadata` sourced from `src/lib/seo-metadata.ts` (`getRouteMetadata('routeKey')`) and renders either an existing `src/components/*.tsx` view directly (the common case — most routes need no client-side navigation, e.g. `RepairAnalytics`, `CompanyBlueprintGovernance`, `HardwareDiagnosticTool`, `RepairEstimateCalculator`, `Auth0FlowsHub`), or a `src/views/*.tsx` wrapper when the view needs a client-side navigation callback (Server Components can't pass closures to Client Components as props — see below).

- `src/components/SiteHeader.tsx` / `SiteFooter.tsx` render the persistent nav/footer from `app/layout.tsx`, using `next/link` and `usePathname()` for active-route highlighting — there is no more `activeTab` state.
- `src/views/*.tsx` (`AboutView`, `AcademyView`, `BookingView`, `BoardDatabaseView`, `EnterpriseView`) are `"use client"` wrappers whose only job is calling `useRouter().push(...)` and passing it down as a prop to the real view component — this pattern exists because a route's `page.tsx` must stay a Server Component to export `metadata`.
- `src/lib/seo-metadata.ts` is the single source of truth for per-route `<title>`/description/OG tags (`ROUTE_META_MAP`, keyed by route, one entry per page) — this replaced a runtime `document.title`-mutating component from the Vite era.

### API: Next.js Route Handlers, grouped by original Express route

`app/api/**/route.ts` files each export named HTTP method functions (`GET`, `POST`, etc.) — there is no more single `server.ts` Express app. Route groups: `db/*` (Aurora health/metrics/admin), `auth/*` (Auth0 RBAC config, GitHub OAuth), `github/*` (webhook receiver + repo sync), `elevenlabs/*` (TTS, voice intake, agent proxy), `ai/*` (Gemini/OpenAI diagnostics), `stripe/*` (webhook handling + a legacy `create-payment-intent` endpoint — see Stripe below, checkout-session creation is *not* here anymore), `repair-status/*`, `client/orders`, `intake/sync`, `support/*`, `academy/generate-video`, `booking/schedule`. The GitHub OAuth popup callback lives outside `/api` at `app/auth/github/callback/route.ts` and `app/auth/callback/route.ts` (an alias) since it returns HTML, not JSON — both delegate to the shared `handleGithubOAuthCallback` in `src/lib/githubOAuthCallback.ts`. `app/api/github/webhook/route.ts` and `app/api/github/webhooks/route.ts` are likewise aliases delegating to `handleIncomingGithubWebhook` in `src/lib/githubWebhookHandler.ts`.

- `app/actions/*.ts` files are Next.js **Server Actions** (`'use server'`) — an alternative to Route Handlers for form/mutation-style calls invoked directly from Client Components without a fetch. Currently just `app/actions/stripe.ts`'s `startCheckoutSession()` (see Stripe below).
- Rate limiting: `aiRateLimiterNext` / `formRateLimiterNext` from `src/lib/serverSecurity.ts` — call `.check(req)` at the top of a handler (or, in a Server Action, wrap a synthetic request built from `await headers()`); a non-null return is a ready-to-return 429 `NextResponse`.
- Request validation uses Zod schemas centralized in `src/lib/schemas.ts` (e.g. `DiagnoseSchema`, `SmartTriageSchema`, `BookingScheduleSchema`) — framework-agnostic, unchanged by the migration.
- `getOpenAI()` / `getGemini()` (lazy client getters) live in `src/lib/aiClients.ts`. `getStripe()` lives in `src/lib/stripe.ts`. When reading Gemini responses, `@google/genai`'s `GenerateContentResponse` exposes the text as a plain `.text` property, not a `.response.text()` call (that's the older `@google/generative-ai` SDK's shape) — a mismatch here is a `tsc --noEmit` error, not a runtime-only bug, so `npm run lint` catches it.
- Shared GitHub webhook/sync state (the in-memory `webhookEventsLog` FIFO buffer, signature verification, token lookup) lives in `src/lib/githubSync.ts` — same per-instance/best-effort in-memory caveat it had under Express; not durable across serverless invocations. Stripe's webhook log (`stripeWebhookEventsLog`) in `src/lib/stripeWebhook.ts` follows the same in-memory pattern, inspectable via `GET /api/stripe/webhook/events`.
- Security headers (CSP etc.) are set globally via `next.config.js`'s `headers()`, not per-request middleware.
- Dynamic route params are async in this Next version — `{ params }: { params: Promise<{ ticketNumber: string }> }`, `await params` inside the handler.

### Database: dual Postgres access paths

- `src/lib/serverDb.ts` — server-only pooled `pg` access to AWS RDS Aurora Postgres, with IAM auth via `@aws-sdk/rds-signer` and a read-replica pool split (`getDatabasePool()` / read-only pool). Route Handlers dynamically `import('.../src/lib/serverDb.ts')` inside the handler body rather than importing at module top level.
- `prisma/schema.prisma` — Prisma models exist only for NextAuth-style `Account`/`Session`/`User`/`VerificationToken` tables; this is a narrower, separate concern from the hand-rolled `pg` pool. **`src/lib/prisma.ts` is not a real Prisma client** — it's a no-op stub (`new Proxy({}, { get: () => noOp })`) with no `@prisma/client` import and nothing in the repo imports it; treat the schema as aspirational/unwired rather than assuming `prisma.ts` does anything at runtime.
- `src/lib/db.ts` — client-side/offline layer: local SQLite-backed offline storage interface and React hooks (`useDatabase`/`useOfflineDatabase`) for persisting repair intake drafts when offline, syncing later.
- `src/lib/dbOptimizations.ts` — a static reference module of index recommendations, DDL scripts, and connection-pool stats used by `DatabaseOptimizationPanel.tsx`/`SupportedDevicesDatabase.tsx` and `/api/db/indexes/suggestions`; not a live DB connector itself.
- Don't conflate these — pick the one matching where the code runs (Route Handler vs. Prisma auth tables vs. browser offline storage), and don't assume `prisma.ts` is live.

### Third-party integrations

Each major integration gets its own `src/lib/*.ts` module plus one or more `src/components/*.tsx` UI surfaces:
- **Shopify**: `src/lib/shopify.ts` (storefront GraphQL fetch), `shopify-queries.ts`, `shopify-types.ts`, `src/lib/shopify/operations/`, cart logic in `cart-actions.ts` (`getCart`/`addToCart`/etc., cart ID persisted to `localStorage` client-side or an in-memory fallback server-side) used by `AddToCartButton.tsx`. Wired into the device intake flow (`IntakeForm.tsx` → `/api/intake/sync`).
- **Auth0**: server-side sessions via `@auth0/nextjs-auth0` (v4), not a client-side SPA SDK. `src/lib/auth0Server.ts` constructs the singleton `Auth0Client`, with routes remapped under `/auth0/*` (`login`/`logout`/`callback`/`profile`/`access-token`/`backchannel-logout`) specifically to avoid colliding with the unrelated GitHub OAuth popup flow, which already owns `/auth/callback` and `/auth/github/callback`. `middleware.ts` at the **repo root** (not `src/` — Next only auto-detects `middleware.ts`/`src/middleware.ts` when `app/` itself lives under `src/app`, which it doesn't here) wraps `auth0.middleware(request)` and mounts those routes; its matcher excludes only `_next/static`, `_next/image`, and the metadata files. `src/components/Auth0ProviderWithConfig.tsx` no longer wraps the tree in a context provider (v4's `useUser()` needs none) — it's a passthrough component kept only so `app/layout.tsx` doesn't need to change, and exports `useSafeAuth0()`, a thin adapter over `useUser()`/`getAccessToken()` (both from `@auth0/nextjs-auth0/client`, pointed at the `/auth0/*` routes) that preserves the old `{isConfigured, isAuthenticated, isLoading, user, loginWithRedirect, loginWithPopup, logout, getAccessTokenSilently}` shape for its 5 consumers (`Auth0UserButton.tsx`, `UserProfile.tsx`, `ClientProfileRepairOrders.tsx`, `Auth0RbacModal.tsx`) so they didn't need rewrites. `loginWithPopup` is a compatibility shim — v4 has no popup mode, so it does a full-page redirect like `loginWithRedirect`. `auth0-mgmt.ts` (Management API) and `auth0Rbac.ts` are unchanged; `auth0Rbac.ts`'s `evaluateUserRbac()` still just reads `https://dcp.app/{roles,permissions,groups}` off whatever `user` object it's given, so it doesn't care that `user` now comes from a server session instead of a client SDK. UI in `Auth0FlowsHub.tsx`, `Auth0UserButton.tsx`, `Auth0RbacModal.tsx`, `Auth0TenantAuditReport.tsx`. Required env: `AUTH0_DOMAIN`/`AUTH0_CLIENT_ID`/`AUTH0_CLIENT_SECRET`/`AUTH0_SECRET`/`APP_BASE_URL` (server-only now — no `NEXT_PUBLIC_AUTH0_*` needed for the SDK itself, though `NEXT_PUBLIC_AUTH0_DOMAIN`/`NEXT_PUBLIC_AUTH0_CLIENT_ID` are still read client-side as a best-effort "is this deployment configured" UI signal). **No Route Handler currently gates on the Auth0 session** (`auth0.getSession()` isn't called anywhere yet) — today's auth is UI-only, same gap the old SPA setup had; adding server-side route guards is unstarted follow-up work, not part of this migration. `src/lib/vercelAuth.ts` (despite the name) exchanges an Auth0 authorization code for a token against `AUTH0_ISSUER`/oauth/token, used by `scripts/refresh-token.ts` — unrelated to the `@auth0/nextjs-auth0` session flow above.
- **ElevenLabs** (voice AI): several `Eleven*` components (TTS generator, conversation flow, voice studio settings, agent inspector, knowledge/tools hub) plus `/api/elevenlabs/*` Route Handlers proxying the ElevenLabs API.
- **Stripe**: checkout-session creation is a **Server Action**, not a Route Handler — `app/actions/stripe.ts`'s `startCheckoutSession()` rate-limits, calls `getStripe()` (`src/lib/stripe.ts`), and creates an embedded (`ui_mode: 'embedded'`) Checkout Session, returning `client_secret`. `StripeCheckoutModal.tsx` calls it directly and renders `@stripe/react-stripe-js`'s `EmbeddedCheckoutProvider`/`EmbeddedCheckout`; `StripeCheckoutComponent.tsx` is a button wrapper around the modal. Consumers: `PaymentCheckout.tsx`, `RepairEstimateCalculator.tsx` (via the modal), `ProjectEstimator.tsx` (via the component). `/api/stripe/create-payment-intent` is a separate, older raw-PaymentIntent path (falls back to a mocked client secret when `STRIPE_SECRET_KEY` is unset, for sandbox testing) — don't assume it's the same flow as the embedded checkout. `/api/stripe/webhook` (delegating to `src/lib/stripeWebhook.ts`) and `/api/stripe/webhook/events` (debug log of received webhook events) round out the Stripe routes; there is no more `/api/checkout/*`. Client publishable key: `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`.
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
- `src/lib/technicianEvents.ts` is a cross-tab/cross-window notification bus (`BroadcastChannel` + `localStorage` + a custom event) that fires when a new intake is submitted, consumed by `Toast.tsx` and `IntakeForm.tsx`.
- `src/lib/lexical-firewall.ts` (regex-based payload/AI-output sanitizer) currently has no importers anywhere in the repo — treat it as dead code, not an active security control, unless you're the one wiring it in.
- Path alias `@/*` maps to both `src/*` and repo root (see `tsconfig.json`) — used inconsistently, check existing imports in a file before adding new ones.
- Client-exposed env vars use the `NEXT_PUBLIC_*` prefix (not Vite's `VITE_*`) — see `.env.example`.
- Ambient module declarations for non-code imports live in `src/modules.d.ts` (wildcard patterns like `declare module '*.jpg'`), separate from `src/globals.d.ts` (the `declare global { interface Window {...} } / export {}` augmentation). TypeScript only honors wildcard `declare module` patterns in a file with **no top-level `import`/`export`** — putting them in the same file as an `export {}` (needed for `declare global`) makes them silently stop matching anything, with no compiler warning. Add new asset-extension declarations to `modules.d.ts`, not `globals.d.ts`.

### Testing

Vitest tests (`*.test.ts`) are colocated next to the source they test (not in a separate `__tests__` tree). Coverage is partial — most `src/lib/*.ts` and a few components/hooks. When adding logic to `pricing.ts`, `schemas.ts`, `completionCalculator.ts`, `db.ts`, or `useFounderAnimationSpeed.ts`, check for and update the adjacent `.test.ts` file.
