# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

- `pnpm install` — install dependencies
- `pnpm build` — compile TypeScript (generates .d.ts files only)
- `pnpm check` — lint/format check with Biome
- `pnpm check:write` — auto-fix lint/format issues
- `pnpm test` — run all tests with Vitest
- `pnpm test --watch` — watch mode
- Single test: `pnpm test <filename>` (e.g., `pnpm test filter`)

## Architecture

- Modular utility library for Google Apps Script — each `src/*.ts` file exports a single standalone function
- Functions use parameter object pattern (destructured object params, not positional args)
- No inter-module dependencies; functions are designed to be copied individually into GAS projects
- Functions depend on GAS globals (`DriveApp`, `SpreadsheetApp`, `UrlFetchApp`, `Logger`, `Utilities`) available at runtime
- `type SheetCell = number | string | boolean | Date | null | undefined` is defined locally in multiple files (not centralized)
- Build emits only `.d.ts` declaration files to `dist/` (`emitDeclarationOnly: true`)

## Documentation

- `README.md` — Library user-facing: function table, usage, dev commands
- `test/README.md` — Developer-facing: mock architecture, usage patterns, how to write new tests
- When adding new `src/` files, update the function table in `README.md`

## Testing

- Vitest with mocks for GAS APIs in `test/mocks/` (details in `test/README.md`)
- Mock setup functions (`setupDriveApp`, `setupSpreadsheetApp`, `setupUrlFetchApp`) inject mocks into `globalThis`
- `UrlFetchApp` mock differs: `setupUrlFetchApp()` takes no config, use `mockFetchSuccess`/`mockFetchHttpError`/`mockFetchNetworkError` helpers
- Tests mirror source: `src/foo.ts` → `test/foo.test.ts`

## Tooling

- Package manager: pnpm
- Linter/formatter: Biome (not ESLint/Prettier)
- TypeScript targets ESNext with `noImplicitAny`
