// Static image import types (*.jpg, *.png, *.svg, ...).
//
// Next normally supplies these through the generated `next-env.d.ts`, but that
// file is gitignored and only written by `next dev` / `next build`. CI runs
// `npm run lint` (tsc --noEmit) *before* `npm run build`, so on a fresh
// checkout nothing has generated it yet and every static image import fails
// with TS2307.
//
// Referencing Next's own declaration from a tracked file makes the typecheck
// self-sufficient. It is the exact reference `next-env.d.ts` emits, so the two
// coexist without conflict once that file is generated.
/// <reference types="next/image-types/global" />
