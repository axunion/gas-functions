# GAS Functions

TypeScript utility functions for Google Apps Script.

## Functions

| Function | Description |
|----------|-------------|
| `detectImageMimeType` | Detect image MIME type |
| `duplicateFile` | Duplicate a file |
| `filter` | Array filtering |
| `formatEmailTemplate` | Format email templates |
| `getConfig` | Get configuration values |
| `getIndexes` | Get indexes from array |
| `getUniqueValues` | Get unique values |
| `groupBy` | Group array by key |
| `listFiles` | List files in folder |
| `saveImage` | Save image to Drive |
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

Tests use [Vitest](https://vitest.dev/) with mock implementations for GAS services (`DriveApp`, `SpreadsheetApp`, `UrlFetchApp`).

```bash
pnpm test           # Run all tests
pnpm test --watch   # Watch mode
```
