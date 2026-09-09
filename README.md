# Display & Cell Pros

Marketing site, client repair-status portal, and internal ops console for
Display & Cell Pros LLC (D&CP), an electronics repair lab. A Next.js 15 App
Router application — see [CLAUDE.md](CLAUDE.md) for the full architecture
writeup (routing, API route handlers, database access paths, third-party
integrations).

## Run locally

**Prerequisites:** Node.js >= 22

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the values you need
   (Auth0, Shopify, Stripe, AI provider keys, database connection, etc. —
   most features degrade gracefully when their env vars are unset).
3. Start the dev server:
   ```
   npm run dev
   ```

## Other commands

- `npm run build` — production build (`next build`)
- `npm start` — serve the production build (`next start`)
- `npm run lint` — typecheck (`tsc --noEmit`)
- `npm test` — unit tests (`vitest run`)
- `npm run preflight` — runs the same lint → test → build gate as CI, reproducing
  a fresh checkout (see `scripts/preflight.mjs`); this is also what
  `.githooks/pre-push` runs before a `git push` leaves your machine
