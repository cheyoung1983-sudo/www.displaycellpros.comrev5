# TypeScript Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve TypeScript build errors resulting from dependency upgrades (Next.js 16, Prisma 7, Auth0/NextAuth) by updating code to match new type definitions and breaking changes.

**Architecture:** Systematic remediation of type errors by aligning auth and prisma code with updated library interfaces.

**Tech Stack:** Next.js 16, TypeScript, NextAuth, Prisma 7.

## Global Constraints

- Must resolve all TypeScript errors during `npm run build`.
- Maintain existing authentication and database functionality.

---

### Task 1: Fix `src/lib/prisma.ts`

**Files:**
- Modify: `src/lib/prisma.ts`

- [ ] **Step 1: Check `@prisma/client` documentation for Prisma 7 `PrismaClient` export changes**
- [ ] **Step 2: Update `src/lib/prisma.ts` to use correct `PrismaClient` import**

```typescript
// Proposed fix
import { PrismaClient } from "@prisma/client";
```
*(Verify if PrismaClient is now a default export or named export in Prisma 7)*

- [ ] **Step 3: Run build to verify error is resolved**
- [ ] **Step 4: Commit**

### Task 2: Fix Auth Routes (`src/app/api/auth/...`)

**Files:**
- Modify: `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `src/app/api/auth/callback/route.ts`
- Modify: `src/app/api/auth/refresh/route.ts`
- Modify: `src/app/api/auth/start/route.ts`

- [ ] **Step 1: Update `authorize` callback in `[...nextauth]/route.ts` to match `User` type requirements**
- [ ] **Step 2: Fix token property access (e.g., `expires_in` -> `expiresAt`, `access_token` -> `accessToken`)**
- [ ] **Step 3: Fix `session.strategy` type error in `authOptions`**
- [ ] **Step 4: Update other auth routes to match the new token structure**
- [ ] **Step 5: Run build to verify errors are resolved**
- [ ] **Step 6: Commit**

### Task 3: Fix Remaining API and Components

**Files:**
- Modify: `src/app/api/refresh-token/route.ts`
- Modify: `src/components/ServicesView.tsx`
- Modify: `src/components/StoreView.tsx`
- Modify: `src/lib/vercelAuth.ts`

- [ ] **Step 1: Update token property access in `api/refresh-token/route.ts`**
- [ ] **Step 2: Fix missing imports in `ServicesView.tsx` and `StoreView.tsx` (`SERVICES`, `STORE_PRODUCTS`)**
- [ ] **Step 3: Update `vercelAuth.ts` to use correct `@vercel/functions` API**
- [ ] **Step 4: Run build to verify all errors are resolved**
- [ ] **Step 5: Commit**

---

## Plan complete and saved to `docs/superpowers/plans/2026-07-30-typescript-fixes.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
