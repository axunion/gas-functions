# Testing Guide

This project uses [Vitest](https://vitest.dev/) with custom mock implementations for Google Apps Script (GAS) services. Since GAS APIs (`DriveApp`, `SpreadsheetApp`, `UrlFetchApp`) are only available in the GAS runtime, we inject mocks into `globalThis` to simulate them in a Node.js test environment.

## Mock Architecture

All mocks live in `test/mocks/` and share the same pattern:

1. **`setupXxxApp(config)`** -- Injects a mock into `globalThis` so the source code under test can call `DriveApp`, `SpreadsheetApp`, etc. as it would in GAS.
2. **`createMockXxx(config)`** -- Lower-level factory functions. Use these when you need finer control than `setupXxxApp` provides.
3. **`mockXxxApp`** -- Module-level references to the injected mock. Use them for assertions (`expect(mockUrlFetchApp.fetch).toHaveBeenCalled()`).

### Available Mocks

| Module | Setup Function | Mock Reference | Key Factories |
|--------|---------------|----------------|---------------|
| `DriveApp.ts` | `setupDriveApp(config)` | `mockDriveApp` | `createMockFile`, `createMockFolder` |
| `SpreadsheetApp.ts` | `setupSpreadsheetApp(config)` | `mockSpreadsheetApp` | `createMockSheet`, `createMockRange`, `createMockSpreadsheet` |
| `UrlFetchApp.ts` | `setupUrlFetchApp()` | `mockUrlFetchApp` | `createMockResponse`, `mockFetchSuccess`, `mockFetchHttpError`, `mockFetchNetworkError` |

All exports are re-exported from `test/mocks/index.ts`.

## Usage Patterns

### DriveApp

Configure folders and files, then call `setupDriveApp`:

```ts
import { setupDriveApp } from "./mocks";

setupDriveApp({
  folders: {
    "folder-id": {
      id: "folder-id",
      name: "My Folder",
      files: [
        { id: "file-1", name: "report.txt", lastUpdated: new Date("2024-01-01") },
        { id: "file-2", name: "data.csv", mimeType: "text/csv" },
      ],
    },
  },
  files: {
    "file-1": { id: "file-1", name: "report.txt" },
  },
});
```

Source code can then call `DriveApp.getFolderById("folder-id")` or `DriveApp.getFileById("file-1")` and receive the configured mocks. Accessing a non-existent ID throws an error, matching real GAS behavior.

### SpreadsheetApp

Configure spreadsheets with sheets and cell data:

```ts
import { setupSpreadsheetApp } from "./mocks";

setupSpreadsheetApp({
  spreadsheets: {
    "ss-id": {
      id: "ss-id",
      sheets: [
        {
          name: "Sheet1",
          data: [
            ["Name", "Age"],
            ["Alice", 30],
            ["Bob", 25],
          ],
        },
      ],
    },
  },
});
```

Source code can call `SpreadsheetApp.openById("ss-id")` to get the spreadsheet, then use `getSheetByName`, `getDataRange`, `getRange`, etc.

### UrlFetchApp

Unlike the other mocks, `setupUrlFetchApp()` takes no config. Instead, use helper functions to set the response before each test:

```ts
import {
  setupUrlFetchApp,
  mockFetchSuccess,
  mockFetchHttpError,
  mockFetchNetworkError,
  mockUrlFetchApp,
} from "./mocks";

// Setup
setupUrlFetchApp();

// Simulate a 200 response
mockFetchSuccess({ ok: true, data: "value" });

// Simulate an HTTP error
mockFetchHttpError(500, { error: "server_error" });

// Simulate a network failure
mockFetchNetworkError("Connection refused");

// Assert on calls
expect(mockUrlFetchApp.fetch).toHaveBeenCalledWith(
  "https://example.com/api",
  expect.objectContaining({ method: "post" }),
);
```

## Writing a New Test

1. Create `test/<functionName>.test.ts` to match `src/<functionName>.ts`.
2. Import the function under test and the mocks you need:
   ```ts
   import { beforeEach, describe, expect, it, vi } from "vitest";
   import { myFunction } from "../src/myFunction";
   import { setupDriveApp } from "./mocks";
   ```
3. Call `setupXxxApp()` in `beforeEach` (or at the top of each test) and reset mocks:
   ```ts
   beforeEach(() => {
     vi.clearAllMocks();
     setupDriveApp({ /* config */ });
   });
   ```
4. Write tests using standard Vitest patterns (`describe`, `it`, `expect`).

For functions that don't use GAS APIs (e.g., pure data transformations like `filter` or `groupBy`), no mock setup is needed.
