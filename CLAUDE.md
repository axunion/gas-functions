# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

- `pnpm install` — install dependencies
- `pnpm typecheck` — type check with tsc (`--noEmit`, no build output)
- `pnpm check` — lint/format check with Biome
- `pnpm check:write` — auto-fix lint/format issues
- `pnpm test` — run all tests with Vitest
- `pnpm test --watch` — watch mode
- Single test: `pnpm test <filename>` (e.g., `pnpm test filter`)

## Architecture

- Modular utility library for Google Apps Script — each `src/*.ts` file exports a single standalone function
- Functions use parameter object pattern (destructured object params, not positional args)
- No inter-module dependencies; functions are designed to be copied individually into GAS projects
- Functions depend on GAS globals (`DriveApp`, `SpreadsheetApp`, `UrlFetchApp`, `Utilities`) available at runtime; logging uses `console` (V8 runtime standard)
- `type SheetCell = number | string | boolean | Date | null | undefined` is defined locally in multiple files (not centralized)
- No build output — `tsc` runs with `noEmit` for type checking only; consumers copy `.ts` source files directly
- `export` statements exist only for testing; users delete them after copying (GAS has no ES module support)
- Keep error handling simple (GAS scripts, not servers): validate inputs up front (non-empty strings etc.), then let GAS API errors propagate as-is — never wrap errors in try/catch just to relabel the message. Use catch only when processing must continue (e.g. skipping a bad file in a loop); stringify the `unknown` error with `String(e)` there
- Don't add runtime `typeof` checks for values the TypeScript signature already guarantees; the exception is functions that validate untrusted runtime input by design (e.g. `validateParameters`, API response shapes in `verifyRecaptcha`)

## Documentation

- `README.md` — Library user-facing: function table, usage, dev commands
- `test/README.md` — Developer-facing: mock architecture, usage patterns, how to write new tests
- When adding new `src/` files, update the function table in `README.md`

## Testing

- Vitest with mocks for GAS APIs in `test/mocks/` (details in `test/README.md`)
- Mock setup functions (`setupDriveApp`, `setupSpreadsheetApp`, `setupUrlFetchApp`, `setupUtilities`) inject mocks into `globalThis`
- `UrlFetchApp` mock differs: `setupUrlFetchApp()` takes no config, use `mockFetchSuccess`/`mockFetchHttpError`/`mockFetchNetworkError`/`mockFetchInvalidJson` helpers
- Tests mirror source: `src/foo.ts` → `test/foo.test.ts`
- Test naming: plain declarative names (`"throws if ..."`, `"returns ..."`); GAS-dependent functions group tests into `validation` / `successful ...` / `error handling` describes
- `beforeEach` order: `vi.clearAllMocks()` first, then `setupXxx()`

## Tooling

- Package manager: pnpm
- Linter/formatter: Biome (not ESLint/Prettier)
- TypeScript targets ESNext with `noImplicitAny`
