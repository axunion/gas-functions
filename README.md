# GAS Functions

TypeScript utility functions for Google Apps Script. Each function is standalone
with no inter-module dependencies — copy only the files you need. No build step.

## Functions

| Function | Description |
|----------|-------------|
| `consolidateData` | Consolidate sheets from a Drive folder into the active sheet |
| `detectImageMimeType` | Detect image MIME type and extension from base64 data |
| `duplicateFile` | Duplicate a Drive file into a folder |
| `filter` | Filter sheet rows by a column value |
| `formatEmailTemplate` | Replace `{{placeholder}}`s in a template with data values |
| `getIndexes` | Get column indexes from a header row |
| `getUniqueValues` | Get unique values from a column |
| `groupBy` | Group sheet rows by a column value |
| `listFiles` | List files in a Drive folder, sorted by name or date |
| `saveImage` | Save an image blob to Drive |
| `sendToLine` | Send a LINE push message ([setup guide](docs/sendToLine.setup.md)) |
| `sendToSlack` | Send a Slack message ([setup guide](docs/sendToSlack.setup.md)) |
| `validateParameters` | Validate untrusted input parameters (e.g. `doPost` payloads) |
| `verifyRecaptcha` | Verify a reCAPTCHA response token |

## Usage

Copy the required function files from `src/` to your GAS project.

> **Important:** After copying, delete the trailing `export { ... }` line.
> The export exists only for testing in this repository — GAS does not support
> ES modules, so leaving it in causes a `SyntaxError` at runtime.

## Development

```bash
pnpm install  # Setup
pnpm check    # Lint & format check (Biome) + type check (tsc)
pnpm fix      # Auto-fix lint & format issues
pnpm test     # Run tests (--watch for watch mode)
```

Tests use [Vitest](https://vitest.dev/) with mock implementations for GAS services.
See [test/README.md](test/README.md) for the mock architecture and how to write new tests.
