import { vi } from "vitest";

export type SheetData = (string | number | boolean | null)[][];

export interface MockSheet {
	name: string;
	data: SheetData;
}

export interface MockSpreadsheet {
	id: string;
	sheets: MockSheet[];
}

/** Create a mock Sheet object */
export const createMockSheet = (
	sheet: MockSheet,
): GoogleAppsScript.Spreadsheet.Sheet => {
	const data = sheet.data;
	return {
		getName: () => sheet.name,
		getDataRange: () => createMockRange(data),
		getRange: vi.fn(
			(
				row: number,
				col: number,
				numRows?: number,
				numCols?: number,
			): GoogleAppsScript.Spreadsheet.Range => {
				const startRow = row - 1;
				const startCol = col - 1;
				const endRow = numRows ? startRow + numRows : data.length;
				const endCol = numCols ? startCol + numCols : data[0]?.length || 0;
				const slicedData = data
					.slice(startRow, endRow)
					.map((r) => r.slice(startCol, endCol));
				return createMockRange(slicedData);
			},
		),
		getLastRow: () => data.length,
		getLastColumn: () => data[0]?.length || 0,
		appendRow: vi.fn(),
	} as unknown as GoogleAppsScript.Spreadsheet.Sheet;
};

/** Create a mock Range object */
export const createMockRange = (
	data: SheetData,
): GoogleAppsScript.Spreadsheet.Range =>
	({
		getValues: () => data,
		getValue: () => data[0]?.[0] ?? null,
		setValues: vi.fn(),
		setValue: vi.fn(),
		getNumRows: () => data.length,
		getNumColumns: () => data[0]?.length || 0,
	}) as unknown as GoogleAppsScript.Spreadsheet.Range;

/** Create a mock Spreadsheet object */
export const createMockSpreadsheet = (
	config: MockSpreadsheet,
): GoogleAppsScript.Spreadsheet.Spreadsheet => {
	const sheetsMap = new Map(config.sheets.map((s) => [s.name, s]));
	return {
		getId: () => config.id,
		getSheetByName: (name: string) => {
			const sheet = sheetsMap.get(name);
			return sheet ? createMockSheet(sheet) : null;
		},
		getSheets: () => config.sheets.map((s) => createMockSheet(s)),
		getActiveSheet: () =>
			config.sheets[0] ? createMockSheet(config.sheets[0]) : null,
	} as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
};

export interface MockSpreadsheetAppConfig {
	spreadsheets?: Record<string, MockSpreadsheet>;
}

export const createMockSpreadsheetApp = (
	config: MockSpreadsheetAppConfig = {},
) => ({
	openById: vi.fn((id: string) => {
		const ss = config.spreadsheets?.[id];
		if (!ss) {
			throw new Error(`Spreadsheet not found: ${id}`);
		}
		return createMockSpreadsheet(ss);
	}),
	getActiveSpreadsheet: vi.fn(() => {
		const firstKey = Object.keys(config.spreadsheets || {})[0];
		if (firstKey && config.spreadsheets) {
			return createMockSpreadsheet(config.spreadsheets[firstKey]);
		}
		return null;
	}),
});

export let mockSpreadsheetApp: ReturnType<typeof createMockSpreadsheetApp>;

export const setupSpreadsheetApp = (config: MockSpreadsheetAppConfig = {}) => {
	mockSpreadsheetApp = createMockSpreadsheetApp(config);
	(
		globalThis as unknown as { SpreadsheetApp: typeof mockSpreadsheetApp }
	).SpreadsheetApp = mockSpreadsheetApp;
};
