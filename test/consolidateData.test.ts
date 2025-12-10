import { beforeEach, describe, expect, it, vi } from "vitest";
import { consolidateData } from "../src/spreadSheetConsolidateData";
import {
	createMockSpreadsheet,
	mockSpreadsheetApp,
	setupDriveApp,
	setupSpreadsheetApp,
} from "./mocks";

// Mock Logger global
const mockLogger = {
	log: vi.fn(),
};
(globalThis as unknown as { Logger: typeof mockLogger }).Logger = mockLogger;

const date1 = new Date("2024-01-01T10:00:00Z");
const date2 = new Date("2024-01-02T10:00:00Z");

beforeEach(() => {
	vi.clearAllMocks();
});

describe("consolidateData", () => {
	describe("validation", () => {
		it("throws if sourceStartRow is less than 1", () => {
			setupDriveApp({ folders: {} });
			setupSpreadsheetApp({});

			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Sheet1", startRow: 0 },
					destination: {},
				}),
			).toThrow("Start row and column values must be positive integers");
		});

		it("throws if sourceStartColumn is less than 1", () => {
			setupDriveApp({ folders: {} });
			setupSpreadsheetApp({});

			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Sheet1", startColumn: 0 },
					destination: {},
				}),
			).toThrow("Start row and column values must be positive integers");
		});

		it("throws if destinationStartRow is less than 1", () => {
			setupDriveApp({ folders: {} });
			setupSpreadsheetApp({});

			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Sheet1" },
					destination: { startRow: 0 },
				}),
			).toThrow("Start row and column values must be positive integers");
		});

		it("throws if destinationStartColumn is less than 1", () => {
			setupDriveApp({ folders: {} });
			setupSpreadsheetApp({});

			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Sheet1" },
					destination: { startColumn: -1 },
				}),
			).toThrow("Start row and column values must be positive integers");
		});
	});

	describe("error handling", () => {
		it("throws if folder is not found", () => {
			setupDriveApp({ folders: {} });
			setupSpreadsheetApp({
				spreadsheets: {
					active: {
						id: "active",
						sheets: [{ name: "Destination", data: [] }],
					},
				},
			});

			expect(() =>
				consolidateData({
					folderId: "non-existent",
					source: { sheetName: "Sheet1" },
					destination: {},
				}),
			).toThrow('Error retrieving folder with ID "non-existent"');
		});

		it("throws if no data was consolidated", () => {
			setupDriveApp({
				folders: {
					"folder-id": { id: "folder-id", name: "Test Folder", files: [] },
				},
			});
			setupSpreadsheetApp({
				spreadsheets: {
					active: { id: "active", sheets: [{ name: "Sheet1", data: [] }] },
				},
			});

			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Data" },
					destination: {},
				}),
			).toThrow("No data was consolidated");
		});
	});

	describe("successful consolidation", () => {
		it("consolidates data from multiple spreadsheets", () => {
			// Create mock files that are Google Sheets
			const mockFile1 = {
				id: "file1",
				name: "Spreadsheet1",
				mimeType: "application/vnd.google-apps.spreadsheet",
				lastUpdated: date1,
			};
			const mockFile2 = {
				id: "file2",
				name: "Spreadsheet2",
				mimeType: "application/vnd.google-apps.spreadsheet",
				lastUpdated: date2,
			};

			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [mockFile1, mockFile2],
					},
				},
			});

			// Mock SpreadsheetApp.open to return different spreadsheets based on file
			const mockSpreadsheet1 = createMockSpreadsheet({
				id: "ss1",
				sheets: [
					{
						name: "Data",
						data: [
							["Header1", "Header2"],
							["Value1", "Value2"],
						],
					},
				],
			});

			const mockSpreadsheet2 = createMockSpreadsheet({
				id: "ss2",
				sheets: [
					{
						name: "Data",
						data: [
							["Header1", "Header2"],
							["Value3", "Value4"],
						],
					},
				],
			});

			// Setup active spreadsheet
			const destinationData: (string | number | boolean | null)[][] = [];
			const mockDestinationSheet = {
				getName: () => "Destination",
				getRange: vi.fn(() => ({
					setValues: vi.fn((data) => {
						destinationData.push(...data);
					}),
					getValues: () => [],
					getValue: () => null,
					setValue: vi.fn(),
					getNumRows: () => 0,
					getNumColumns: () => 0,
				})),
				getDataRange: vi.fn(() => ({
					getValues: () => [],
					getValue: () => null,
					setValues: vi.fn(),
					setValue: vi.fn(),
					getNumRows: () => 0,
					getNumColumns: () => 0,
				})),
				getLastRow: () => 0,
				getLastColumn: () => 0,
				appendRow: vi.fn(),
			};

			const mockActiveSpreadsheet = {
				getId: () => "active",
				getActiveSheet: () => mockDestinationSheet,
				getSheetByName: () => mockDestinationSheet,
				getSheets: () => [mockDestinationSheet],
			};

			// Setup SpreadsheetApp with custom open behavior
			setupSpreadsheetApp({ spreadsheets: {} });

			mockSpreadsheetApp.getActiveSpreadsheet.mockReturnValue(
				mockActiveSpreadsheet as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet,
			);

			// Mock SpreadsheetApp.open
			const mockOpen = vi.fn((file: GoogleAppsScript.Drive.File) => {
				const fileName = file.getName();
				if (fileName === "Spreadsheet1") return mockSpreadsheet1;
				if (fileName === "Spreadsheet2") return mockSpreadsheet2;
				throw new Error(`Unknown file: ${fileName}`);
			});

			(
				globalThis as unknown as {
					SpreadsheetApp: typeof mockSpreadsheetApp & {
						open: typeof mockOpen;
					};
				}
			).SpreadsheetApp.open = mockOpen;

			consolidateData({
				folderId: "folder-id",
				source: { sheetName: "Data", startRow: 2 },
				destination: { startRow: 1, startColumn: 1 },
			});

			expect(mockDestinationSheet.getRange).toHaveBeenCalled();
			expect(destinationData.length).toBeGreaterThan(0);
		});

		it("skips non-spreadsheet files", () => {
			const mockPdfFile = {
				id: "pdf1",
				name: "Document.pdf",
				mimeType: "application/pdf",
				lastUpdated: date1,
			};

			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [mockPdfFile],
					},
				},
			});

			setupSpreadsheetApp({
				spreadsheets: {
					active: {
						id: "active",
						sheets: [{ name: "Destination", data: [] }],
					},
				},
			});

			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Data" },
					destination: {},
				}),
			).toThrow("No data was consolidated");
		});

		it("filters rows based on requiredColumns", () => {
			const mockFile = {
				id: "file1",
				name: "Spreadsheet1",
				mimeType: "application/vnd.google-apps.spreadsheet",
				lastUpdated: date1,
			};

			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [mockFile],
					},
				},
			});

			const mockSpreadsheet = createMockSpreadsheet({
				id: "ss1",
				sheets: [
					{
						name: "Data",
						data: [
							["Name", "Email"],
							["John", "john@example.com"],
							["", "missing@example.com"], // Missing name - should be filtered
							["Jane", ""], // Missing email - should be filtered if col 2 is required
						],
					},
				],
			});

			const destinationData: (string | number | boolean | null)[][] = [];
			const mockDestinationSheet = {
				getName: () => "Destination",
				getRange: vi.fn(() => ({
					setValues: vi.fn((data) => {
						destinationData.push(...data);
					}),
					getValues: () => [],
					getValue: () => null,
					setValue: vi.fn(),
					getNumRows: () => 0,
					getNumColumns: () => 0,
				})),
				getDataRange: vi.fn(() => ({
					getValues: () => [],
					getValue: () => null,
					setValues: vi.fn(),
					setValue: vi.fn(),
					getNumRows: () => 0,
					getNumColumns: () => 0,
				})),
				getLastRow: () => 0,
				getLastColumn: () => 0,
				appendRow: vi.fn(),
			};

			const mockActiveSpreadsheet = {
				getId: () => "active",
				getActiveSheet: () => mockDestinationSheet,
				getSheetByName: () => mockDestinationSheet,
				getSheets: () => [mockDestinationSheet],
			};

			setupSpreadsheetApp({ spreadsheets: {} });
			mockSpreadsheetApp.getActiveSpreadsheet.mockReturnValue(
				mockActiveSpreadsheet as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet,
			);

			const mockOpen = vi.fn(() => mockSpreadsheet);
			(
				globalThis as unknown as {
					SpreadsheetApp: typeof mockSpreadsheetApp & {
						open: typeof mockOpen;
					};
				}
			).SpreadsheetApp.open = mockOpen;

			consolidateData({
				folderId: "folder-id",
				source: {
					sheetName: "Data",
					startRow: 2,
					requiredColumns: [1], // Column 1 (Name) is required
				},
				destination: { startRow: 1 },
			});

			// Only rows with non-empty Name should be included
			expect(destinationData.length).toBe(2); // John and Jane rows
		});
	});
});
