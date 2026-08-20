# Fix warnings and errors in the project

This plan addresses several technical issues, type mismatches, and configuration errors identified in the codebase, particularly in `server.ts` and `vite.config.ts`.

## Proposed Changes

### 1. Vite Configuration Fix
- Update `@` path alias in `vite.config.ts` to point to the `src` directory instead of the project root. This ensures that imports like `@/lib/...` resolve correctly to `src/lib/...` during the Vite build/dev process, matching the `tsconfig.json` configuration.

### 2. AI Diagnostic (Gemini API) Fixes in `server.ts`
- **Correct Response Handling**: The `@google/genai` library returns a `GenerateContentResult` object. The generated text must be accessed via `response.response.text()` rather than `response?.text`.
- **Model Name Correction**: Update `gemini-3.7-flash` to a valid model name (e.g., `gemini-1.5-flash` or `gemini-2.0-flash-exp`).
- **Timeout Handling**: Ensure null checks are robust when using `withTimeout`.

### 3. Server Logic and Type Improvements in `server.ts`
- **Express Request Types**: Address the `req.rawBody` type error by adding a proper type definition or casting.
- **Unused Imports/Variables**: Remove or comment out any identified unused imports to clean up the 129KB server file.
- **Duplicate Route Check**: Verify and remove any accidental duplicate route registrations.

### 4. Database Connection Pool Fixes in `src/lib/serverDb.ts`
- **Pool Configuration**: Verify `statement_timeout` property. In standard `pg`, this is not a direct `PoolConfig` property and might need to be set via `options` or a client-level command.

## Verification Plan

### Automated Tests
- Since I cannot run the full build/test suite due to missing `node_modules`, I will use `analyze_file` on the modified files to ensure no new syntax errors are introduced.
- Verify path resolution logic manually by checking file structure.

### Manual Verification
- Review the diffs of the changes.
- If possible, try running a small script to verify the Gemini API response structure.
