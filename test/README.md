# Testing Guide

This project uses [Vitest](https://vitest.dev/) with custom mock implementations for Google Apps Script (GAS) services. Since GAS APIs (`DriveApp`, `SpreadsheetApp`, `UrlFetchApp`, `Utilities`) are only available in the GAS runtime, we inject mocks into `globalThis` to simulate them in a Node.js test environment.

## Mock Architecture

All mocks live in `test/mocks/` and share the same pattern:

1. **`setupXxxApp(config)`** -- Injects a mock into `globalThis` so the source code under test can call `DriveApp`, `SpreadsheetApp`, etc. as it would in GAS.
2. **`createMockXxx(config)`** -- Lower-level factory functions. Use these when you need finer control than `setupXxxApp` provides.
3. **`mockXxxApp`** -- Module-level references to the injected mock. Use them for assertions (`expect(mockUrlFetchApp.fetch).toHaveBeenCalled()`).

### Available Mocks

| Module | Setup Function | Mock Reference | Key Factories / Helpers |
|--------|---------------|----------------|-------------------------|
| `DriveApp.ts` | `setupDriveApp(config)` | `mockDriveApp` | `createMockFile`, `createMockFolder` |
| `SpreadsheetApp.ts` | `setupSpreadsheetApp(config)` | `mockSpreadsheetApp` | `createMockSheet`, `createMockRange`, `createMockSpreadsheet` |
| `UrlFetchApp.ts` | `setupUrlFetchApp()` | `mockUrlFetchApp` | `createMockResponse`, `mockFetchSuccess`, `mockFetchHttpError`, `mockFetchNetworkError`, `mockFetchInvalidJson` |
| `Utilities.ts` | `setupUtilities()` | — | `base64Decode` only |

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

const destination = { id: "dest", sheets: [{ name: "Out", data: [] }] };

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
  activeSpreadsheet: destination,
});
```

- `SpreadsheetApp.openById("ss-id")` resolves against `spreadsheets`; `SpreadsheetApp.open(file)` resolves the same map using the file's ID (configure a Drive file and a spreadsheet with matching IDs).
- `getActiveSpreadsheet()` returns `activeSpreadsheet` if set, otherwise the first entry in `spreadsheets`.
- **Writes are captured**: `getRange(...).setValues(data)` writes back into the config's `data` array, so tests can assert on it afterwards (`expect(destination.sheets[0].data).toEqual([...])`).
- Spreadsheet and sheet instances are memoized per config object, so `mockSpreadsheetApp.getActiveSpreadsheet().getActiveSheet()` returns the same mock the code under test used (useful for asserting `getRange` calls).

### UrlFetchApp

Unlike the other mocks, `setupUrlFetchApp()` takes no config. Instead, use helper functions to set the response before each test:

```ts
import {
  setupUrlFetchApp,
  mockFetchSuccess,
  mockFetchHttpError,
  mockFetchNetworkError,
  mockFetchInvalidJson,
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

// Simulate a 200 response with a non-JSON body
mockFetchInvalidJson();

// Assert on calls
expect(mockUrlFetchApp.fetch).toHaveBeenCalledWith(
  "https://example.com/api",
  expect.objectContaining({ method: "post" }),
);
```

### Utilities

`setupUtilities()` injects a minimal `Utilities` mock (currently `base64Decode` backed by Node's `Buffer`). Call it once in `beforeAll` for tests that decode base64 (e.g. `detectImageMimeType`).

## Writing a New Test

1. Create `test/<functionName>.test.ts` to match `src/<functionName>.ts`.
2. Import the function under test and the mocks you need:
   ```ts
   import { beforeEach, describe, expect, it, vi } from "vitest";
   import { myFunction } from "../src/myFunction";
   import { setupDriveApp } from "./mocks";
   ```
3. In `beforeEach`, reset mocks **first**, then set up:
   ```ts
   beforeEach(() => {
     vi.clearAllMocks();
     setupDriveApp({ /* config */ });
   });
   ```
4. Write tests using standard Vitest patterns (`describe`, `it`, `expect`).

### Conventions

- **Test names are plain declarative sentences**: `"throws if folderId is empty"`, `"returns files sorted by name"` — no `"should ..."` prefix.
- **GAS-dependent functions** group tests into `validation` / `successful ...` / `error handling` describe blocks. Pure functions (e.g. `filter`, `groupBy`) use a flat list of `it`s.
- Since GAS API errors now propagate unwrapped, error-handling tests assert on the mock's error message (e.g. `"Folder not found: <id>"`), not on wrapper text.

For functions that don't use GAS APIs (pure data transformations), no mock setup is needed.
