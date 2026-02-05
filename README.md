# GAS Functions

TypeScript utility functions for Google Apps Script.

## Functions

| Function | Description |
|----------|-------------|
| `detectImageMimeType` | Detect image MIME type |
| `duplicateFile` | Duplicate a file |
| `filter` | Array filtering |
| `formatEmailTemplate` | Format email templates |
| `getIndexes` | Get indexes from array |
| `getUniqueValues` | Get unique values |
| `groupBy` | Group array by key |
| `listFiles` | List files in folder |
| `saveImage` | Save image to Drive |
| `sendToLine` | Send LINE messages |
| `sendToSlack` | Send Slack notifications |
| `spreadSheetConsolidateData` | Consolidate spreadsheet data |
| `validateParameters` | Validate parameters |
| `verifyRecaptcha` | Verify reCAPTCHA |

## Usage

Copy the required function files from `src/` to your GAS project.

## Development

```bash
pnpm install    # Setup
pnpm build      # Build
pnpm check      # Lint & format check
pnpm test       # Run tests
```

## Testing

Tests use [Vitest](https://vitest.dev/) with mock implementations for GAS services (`DriveApp`, `SpreadsheetApp`, `UrlFetchApp`). See [test/README.md](test/README.md) for details on the mock architecture and how to write new tests.

```bash
pnpm test           # Run all tests
pnpm test --watch   # Watch mode
```
