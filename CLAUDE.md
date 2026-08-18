# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Another checkout of the **Display & Cell Pros LLC** device repair site — a Vite + Express SPA (device repair intake, WebUSB hardware diagnostic port monitor, bench QA portal). Architecturally this is near-identical to the sibling repo `www.displaycellpros.comrev4` (same `package.json` name `react-example`, same scripts, same `src/lib` file set, same single-file `server.ts` backend). Treat `rev4`'s `CLAUDE.md` as the fuller architecture reference — this file only covers commands plus the concrete differences that matter when working in *this* checkout.

**This repo is a single-commit scaffold** (`chore: setup project infrastructure and CI/CD`), not a linear continuation of `rev4`'s history. It is missing some fixes present in `rev4` and has a few of its own — don't assume parity between the two without checking. Known differences as of this writing:

- **`src/lib/aurora.ts` hardcodes production Aurora connection defaults directly in source** (`PGHOST`, `AWS_REGION`, `AWS_ROLE_ARN`, `PGDATABASE`, `PGUSER` all fall back to real production values when the corresponding env vars are unset), and unconditionally builds an IAM `Signer` — unlike `rev4`'s version, there's no plain-`PGPASSWORD` fallback path for local dev. Practically: this app will attempt to reach the real production Aurora cluster even with an empty `.env`, rather than failing fast or falling back to a local database.
- The Express-middleware Vite HMR fix present in `rev4` (`hmr: false`, needed because the Express listener doesn't forward WebSocket upgrades to Vite's dev server) is **not** applied here — both `vite.config.ts` and the inline `createViteServer` call in `server.ts` still use the original AI-Studio-scaffold HMR handling. Expect a repeatedly-reconnecting dead `@vite/client` WebSocket in the browser console during `npm run dev`.
- `server.ts` here is missing the `/api/shopify/products` route that exists in `rev4`.
- The `next/link` / `next/headers` stray Next.js imports that broke `rev4`'s typecheck (in `StoreView.tsx` / `cart-actions.ts`) are **already fixed** here — they don't appear in this checkout.
- `.env.example` has no section comments and no pre-filled non-secret values (Auth0 domain/client ID, GitHub client ID, Aurora host, etc. are all blank placeholders here, whereas `rev4`'s `.env.example` ships the real public identifiers) — check `rev4`'s `.env.example` or the Auth0/GitHub dashboards if you need those values.
- **No `package-lock.json` is committed.** Run `npm install` to generate one locally before relying on reproducible installs; CI's `npm install` step will resolve fresh each run.

## Commands

```bash
npm install            # no lockfile committed — this resolves versions fresh
npm run dev             # tsx server.ts — Express server with Vite dev middleware
npm run build             # vite build (client) + esbuild bundles server.ts to dist/server.cjs
npm run vercel-build       # what Vercel actually runs: npm install --include=dev && vite build && esbuild ...
npm run start                # node dist/server.cjs — run the built server
npm run preview                # vite preview (static client only, no API routes)
npm run lint                    # tsc --noEmit (no separate ESLint script; eslint is a devDependency but unused by npm scripts)
npm run test                      # vitest run
npx vitest run path/to/file.test.ts   # run a single test file
```

CI (`.github/workflows/webpack.yml`, on push/PR to `main`, matrix Node 20.x/22.x) runs: `npm install` → `npm run lint` → `npm run test` → `npm run build`.

## Architecture (same as `rev4` — see that repo's CLAUDE.md for full detail)

- **Entry points**: `index.html` → `src/main.tsx` → `src/App.tsx` (client SPA). `server.ts` (~3,270 lines) is simultaneously the dev server (via `tsx server.ts`, Vite as middleware), the production server (bundled to `dist/server.cjs`), and the Vercel serverless entry point (`api/index.ts` re-exports `app` from `server.ts`, routed there by `vercel.json`'s rewrites).
- Route groups inside `server.ts`: Aurora DB health/metrics, Auth0 RBAC + a custom GitHub OAuth flow, a GitHub sync integration (webhooks, SOP/issue/telemetry/commit sync), ElevenLabs TTS/voice-intake, Gemini/OpenAI-backed AI diagnostics (`/api/ai/*`, rate-limited), Stripe checkout, repair-status/completion-estimate endpoints, booking, academy video generation.
- Request validation centralized in `src/lib/schemas.ts` (Zod); rate limiting/caching/security headers centralized in `src/lib/serverSecurity.ts` — reuse both for new endpoints.
- Auth0 SPA client (`@auth0/auth0-react`) is the real auth; `prisma/schema.prisma` (NextAuth-shaped models) is vestigial here too — no `@prisma/client` dependency.
- `src/lib/auth0Rbac.ts` hardcodes the only `SuperAdmin` grant as a specific `google-oauth2|...` subject ID, with a fallback matching the literal email `cheyoung1983@gmail.com`. There's no separate "technician" role in this hardcoded table — technician-level access is gated some other way (DB-backed role check or the generic `dcp` permission); trace `evaluateUserRbac()` callers if you need to find where.

## Conventions

- Path alias `@/*` resolves to `./src/*` first, then repo root (`tsconfig.json`).
- New validation schemas go in `src/lib/schemas.ts`, shared across `server.ts`'s many routes.
- Import paths use explicit `.tsx`/`.ts` extensions (`allowImportingTsExtensions` enabled) — match existing files.
