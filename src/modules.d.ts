// Ambient module declarations for non-code assets and untyped packages.
//
// These must live in a file with no top-level import/export (a "global
// script" .d.ts). TypeScript only honors wildcard `declare module '*.ext'`
// patterns in that context — once a .d.ts has `export {}` (as globals.d.ts
// does, to scope its `declare global` block), wildcard module declarations
// silently stop matching anything instead of erroring, which is why these
// live in their own file.
declare module '*.css';
declare module 'jsqr';

declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.gif';
declare module '*.webp';
declare module '*.avif';
declare module '*.ico';
declare module '*.svg';
