# GAS Functions

A TypeScript utility function library for Google Apps Script.

## Overview

This library provides commonly used Google Apps Script functionality as type-safe TypeScript functions. It includes utilities for Google Drive operations, spreadsheet processing, external API integration, data processing, and validation - all implemented as reusable functions for efficient GAS development.

Each function features proper type definitions and error handling, enabling safe and efficient use across team projects.

## Usage

### 1. Library Registration

1. Deploy this project to Google Apps Script
2. Publish as a library and obtain the library ID

### 2. Using in Projects

Follow these steps in your project:

#### Add library to appsscript.json

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "GasFunctions",
      "libraryId": "YOUR_LIBRARY_ID",
      "version": "1"
    }]
  }
}
```

#### Using Type Definitions

For TypeScript + clasp development, copy the type definition files (.d.ts) to your project.

```typescript
// Usage example
const result = GasFunctions.filter({
  rows: [[1, 'a', true], [2, 'b', false]],
  columnIndex: 1,
  filterValue: 'a',
  retrieveIndexes: [0, 2]
});
```

## Development

### Requirements

- Node.js
- TypeScript
- Google Apps Script API

### Scripts

```bash
# Format
npm run format

# Lint
npm run lint

# Build
npm run build

# Test
npm run test
```

### Testing

Run tests using Vitest:

```bash
npm test
```
