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

/**
 * Create a mock Range object.
 * If `target` is given, setValues writes back into `target.data` at the
 * given 0-based offset, so tests can assert on the sheet's data afterwards.
 */
export const createMockRange = (
	data: SheetData,
	target?: { data: SheetData; startRow: number; startColumn: number },
): GoogleAppsScript.Spreadsheet.Range =>
	({
		getValues: () => data,
		getValue: () => data[0]?.[0] ?? null,
		setValues: vi.fn((values: SheetData) => {
			if (!target) return;
			values.forEach((rowValues, r) => {
				let row = target.data[target.startRow + r];
				if (!row) {
					row = [];
					target.data[target.startRow + r] = row;
				}
				rowValues.forEach((value, c) => {
					row[target.startColumn + c] = value;
				});
			});
		}),
		setValue: vi.fn(),
		getNumRows: () => data.length,
		getNumColumns: () => data[0]?.length || 0,
	}) as unknown as GoogleAppsScript.Spreadsheet.Range;

/** Create a mock Sheet object. Writes via getRange(...).setValues() land in `sheet.data`. */
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
				return createMockRange(slicedData, {
					data,
					startRow,
					startColumn: startCol,
				});
			},
		),
		getLastRow: () => data.length,
		getLastColumn: () => data[0]?.length || 0,
		appendRow: vi.fn(),
	} as unknown as GoogleAppsScript.Spreadsheet.Sheet;
};

/** Create a mock Spreadsheet object. Sheet instances are memoized so repeated lookups return the same mocks. */
export const createMockSpreadsheet = (
	config: MockSpreadsheet,
): GoogleAppsScript.Spreadsheet.Spreadsheet => {
	const sheets = new Map(
		config.sheets.map((s) => [s.name, createMockSheet(s)]),
	);
	return {
		getId: () => config.id,
		getSheetByName: (name: string) => sheets.get(name) ?? null,
		getSheets: () => [...sheets.values()],
		getActiveSheet: () => {
			const first = sheets.values().next();
			if (first.done) {
				throw new Error(`No sheets in spreadsheet: ${config.id}`);
			}
			return first.value;
		},
	} as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
};

export interface MockSpreadsheetAppConfig {
	/** Spreadsheets keyed by ID. `open(file)` also resolves against these using the file's ID. */
	spreadsheets?: Record<string, MockSpreadsheet>;
	/** Spreadsheet returned by getActiveSpreadsheet(). Defaults to the first entry in `spreadsheets`. */
	activeSpreadsheet?: MockSpreadsheet;
}

export const createMockSpreadsheetApp = (
	config: MockSpreadsheetAppConfig = {},
) => {
	// Memoize per config object so tests and code under test see the same mock instances
	const instances = new Map<
		MockSpreadsheet,
		GoogleAppsScript.Spreadsheet.Spreadsheet
	>();
	const getInstance = (ss: MockSpreadsheet) => {
		let instance = instances.get(ss);
		if (!instance) {
			instance = createMockSpreadsheet(ss);
			instances.set(ss, instance);
		}
		return instance;
	};
	const byId = (id: string) => {
		const ss = config.spreadsheets?.[id];
		if (!ss) {
			throw new Error(`Spreadsheet not found: ${id}`);
		}
		return getInstance(ss);
	};

	return {
		openById: vi.fn(byId),
		open: vi.fn((file: GoogleAppsScript.Drive.File) => byId(file.getId())),
		getActiveSpreadsheet: vi.fn(() => {
			const active =
				config.activeSpreadsheet ?? Object.values(config.spreadsheets ?? {})[0];
			if (!active) {
				throw new Error("No active spreadsheet configured");
			}
			return getInstance(active);
		}),
	};
};

export let mockSpreadsheetApp: ReturnType<typeof createMockSpreadsheetApp>;

export const setupSpreadsheetApp = (config: MockSpreadsheetAppConfig = {}) => {
	mockSpreadsheetApp = createMockSpreadsheetApp(config);
	(
		globalThis as unknown as { SpreadsheetApp: typeof mockSpreadsheetApp }
	).SpreadsheetApp = mockSpreadsheetApp;
};
