# GAS Functions

A TypeScript utility function library for Google Apps Script.

## Overview

This library provides commonly used Google Apps Script functionality as type-safe TypeScript functions. It includes utilities for Google Drive operations, spreadsheet processing, external API integration, data processing, and validation - all implemented as reusable functions that can be easily copied and integrated into your GAS projects.

Each function features proper type definitions and error handling, enabling safe and efficient use across team projects.

## Usage

### Using Functions in Your Project

Copy the required function files from the `src/` directory to your Google Apps Script project:

1. Browse the `src/` directory and identify the functions you need
2. Copy the TypeScript files (.ts) to your project
3. Import and use the functions directly in your code

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
