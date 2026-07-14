import { beforeEach, describe, expect, it, vi } from "vitest";
import { consolidateData } from "../src/consolidateData";
import {
	type MockFile,
	type MockSpreadsheet,
	mockSpreadsheetApp,
	setupDriveApp,
	setupSpreadsheetApp,
} from "./mocks";

const date1 = new Date("2024-01-01T10:00:00Z");
const date2 = new Date("2024-01-02T10:00:00Z");

/** A Drive file entry with the Google Sheets MIME type */
const sheetFile = (
	id: string,
	name: string,
	lastUpdated = date1,
): MockFile => ({
	id,
	name,
	mimeType: "application/vnd.google-apps.spreadsheet",
	lastUpdated,
});

/** An empty destination spreadsheet; assert on `sheets[0].data` after consolidation */
const createDestination = (): MockSpreadsheet => ({
	id: "destination",
	sheets: [{ name: "Destination", data: [] }],
});

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("consolidateData", () => {
	describe("validation", () => {
		it("throws if sourceStartRow is less than 1", () => {
			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Sheet1", startRow: 0 },
					destination: {},
				}),
			).toThrow("Start row and column values must be positive integers");
		});

		it("throws if sourceStartColumn is less than 1", () => {
			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Sheet1", startColumn: 0 },
					destination: {},
				}),
			).toThrow("Start row and column values must be positive integers");
		});

		it("throws if destinationStartRow is less than 1", () => {
			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Sheet1" },
					destination: { startRow: 0 },
				}),
			).toThrow("Start row and column values must be positive integers");
		});

		it("throws if destinationStartColumn is less than 1", () => {
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
		it("propagates the DriveApp error if folder is not found", () => {
			setupDriveApp({ folders: {} });
			setupSpreadsheetApp({ activeSpreadsheet: createDestination() });

			expect(() =>
				consolidateData({
					folderId: "non-existent",
					source: { sheetName: "Sheet1" },
					destination: {},
				}),
			).toThrow("Folder not found: non-existent");
		});

		it("logs and returns without writing when no data was consolidated", () => {
			setupDriveApp({
				folders: {
					"folder-id": { id: "folder-id", name: "Test Folder", files: [] },
				},
			});
			const destination = createDestination();
			setupSpreadsheetApp({ activeSpreadsheet: destination });

			expect(() =>
				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Data" },
					destination: {},
				}),
			).not.toThrow();

			expect(destination.sheets[0].data).toEqual([]);
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining("No data was consolidated"),
			);
		});

		it("skips a file that fails to open and processes the rest", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [sheetFile("broken", "Broken"), sheetFile("file1", "Src1")],
					},
				},
			});
			const destination = createDestination();
			setupSpreadsheetApp({
				// "broken" is missing on purpose, so SpreadsheetApp.open throws for it
				spreadsheets: {
					file1: { id: "file1", sheets: [{ name: "Data", data: [["a", 1]] }] },
				},
				activeSpreadsheet: destination,
			});

			consolidateData({
				folderId: "folder-id",
				source: { sheetName: "Data" },
				destination: {},
			});

			expect(destination.sheets[0].data).toEqual([["Src1", "a", 1]]);
		});
	});

	describe("successful consolidation", () => {
		it("consolidates data from multiple spreadsheets", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [
							sheetFile("file1", "Spreadsheet1"),
							sheetFile("file2", "Spreadsheet2", date2),
						],
					},
				},
			});
			const destination = createDestination();
			setupSpreadsheetApp({
				spreadsheets: {
					file1: {
						id: "file1",
						sheets: [
							{
								name: "Data",
								data: [
									["Header1", "Header2"],
									["Value1", "Value2"],
								],
							},
						],
					},
					file2: {
						id: "file2",
						sheets: [
							{
								name: "Data",
								data: [
									["Header1", "Header2"],
									["Value3", "Value4"],
								],
							},
						],
					},
				},
				activeSpreadsheet: destination,
			});

			consolidateData({
				folderId: "folder-id",
				source: { sheetName: "Data", startRow: 2 },
				destination: { startRow: 1, startColumn: 1 },
			});

			expect(destination.sheets[0].data).toEqual([
				["Spreadsheet1", "Value1", "Value2"],
				["Spreadsheet2", "Value3", "Value4"],
			]);
		});

		it("skips non-spreadsheet files", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [
							{
								id: "pdf1",
								name: "Document.pdf",
								mimeType: "application/pdf",
								lastUpdated: date1,
							},
						],
					},
				},
			});
			const destination = createDestination();
			setupSpreadsheetApp({ activeSpreadsheet: destination });

			consolidateData({
				folderId: "folder-id",
				source: { sheetName: "Data" },
				destination: {},
			});

			expect(destination.sheets[0].data).toEqual([]);
		});

		it("skips files that do not contain the source sheet", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [sheetFile("file1", "Src1"), sheetFile("file2", "Src2")],
					},
				},
			});
			const destination = createDestination();
			setupSpreadsheetApp({
				spreadsheets: {
					file1: { id: "file1", sheets: [{ name: "Other", data: [["x"]] }] },
					file2: { id: "file2", sheets: [{ name: "Data", data: [["a", 1]] }] },
				},
				activeSpreadsheet: destination,
			});

			consolidateData({
				folderId: "folder-id",
				source: { sheetName: "Data" },
				destination: {},
			});

			expect(destination.sheets[0].data).toEqual([["Src2", "a", 1]]);
		});

		it("filters rows based on requiredColumns", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [sheetFile("file1", "Spreadsheet1")],
					},
				},
			});
			const destination = createDestination();
			setupSpreadsheetApp({
				spreadsheets: {
					file1: {
						id: "file1",
						sheets: [
							{
								name: "Data",
								data: [
									["Name", "Email"],
									["John", "john@example.com"],
									["", "missing@example.com"], // Missing name - should be filtered
									["Jane", ""],
								],
							},
						],
					},
				},
				activeSpreadsheet: destination,
			});

			consolidateData({
				folderId: "folder-id",
				source: {
					sheetName: "Data",
					startRow: 2,
					requiredColumns: [1], // Column 1 (Name) is required
				},
				destination: { startRow: 1 },
			});

			expect(destination.sheets[0].data).toEqual([
				["Spreadsheet1", "John", "john@example.com"],
				["Spreadsheet1", "Jane", ""],
			]);
		});

		it("respects maxRows and maxColumns", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [sheetFile("file1", "Src1")],
					},
				},
			});
			const destination = createDestination();
			setupSpreadsheetApp({
				spreadsheets: {
					file1: {
						id: "file1",
						sheets: [
							{
								name: "Data",
								data: [
									["a1", "b1", "c1"],
									["a2", "b2", "c2"],
									["a3", "b3", "c3"],
								],
							},
						],
					},
				},
				activeSpreadsheet: destination,
			});

			consolidateData({
				folderId: "folder-id",
				source: { sheetName: "Data", maxRows: 2, maxColumns: 2 },
				destination: {},
			});

			expect(destination.sheets[0].data).toEqual([
				["Src1", "a1", "b1"],
				["Src1", "a2", "b2"],
			]);
		});

		it("writes data at the destination start row and column", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [sheetFile("file1", "Src1")],
					},
				},
			});
			const destination = createDestination();
			setupSpreadsheetApp({
				spreadsheets: {
					file1: { id: "file1", sheets: [{ name: "Data", data: [["a", 1]] }] },
				},
				activeSpreadsheet: destination,
			});

			consolidateData({
				folderId: "folder-id",
				source: { sheetName: "Data" },
				destination: { startRow: 2, startColumn: 3 },
			});

			const destinationSheet = mockSpreadsheetApp
				.getActiveSpreadsheet()
				.getActiveSheet();
			expect(destinationSheet.getRange).toHaveBeenCalledWith(2, 3, 1, 3);
			expect(destination.sheets[0].data[1]?.[2]).toBe("Src1");
			expect(destination.sheets[0].data[1]?.[3]).toBe("a");
			expect(destination.sheets[0].data[1]?.[4]).toBe(1);
		});

		describe("file sorting", () => {
			const setupTwoFiles = (files: MockFile[]) => {
				setupDriveApp({
					folders: {
						"folder-id": { id: "folder-id", name: "Test Folder", files },
					},
				});
				const destination = createDestination();
				setupSpreadsheetApp({
					spreadsheets: {
						file1: {
							id: "file1",
							sheets: [{ name: "Data", data: [["from1"]] }],
						},
						file2: {
							id: "file2",
							sheets: [{ name: "Data", data: [["from2"]] }],
						},
					},
					activeSpreadsheet: destination,
				});
				return destination;
			};

			it("processes files sorted by name ascending by default", () => {
				const destination = setupTwoFiles([
					sheetFile("file2", "B", date1),
					sheetFile("file1", "A", date2),
				]);

				consolidateData({
					folderId: "folder-id",
					source: { sheetName: "Data" },
					destination: {},
				});

				expect(destination.sheets[0].data).toEqual([
					["A", "from1"],
					["B", "from2"],
				]);
			});

			it("processes files sorted by name descending", () => {
				const destination = setupTwoFiles([
					sheetFile("file1", "A", date2),
					sheetFile("file2", "B", date1),
				]);

				consolidateData({
					folderId: "folder-id",
					sort: { key: "name", order: "desc" },
					source: { sheetName: "Data" },
					destination: {},
				});

				expect(destination.sheets[0].data).toEqual([
					["B", "from2"],
					["A", "from1"],
				]);
			});

			it("processes files sorted by date ascending", () => {
				const destination = setupTwoFiles([
					sheetFile("file1", "A", date2),
					sheetFile("file2", "B", date1),
				]);

				consolidateData({
					folderId: "folder-id",
					sort: { key: "date", order: "asc" },
					source: { sheetName: "Data" },
					destination: {},
				});

				expect(destination.sheets[0].data).toEqual([
					["B", "from2"],
					["A", "from1"],
				]);
			});

			it("processes files sorted by date descending", () => {
				const destination = setupTwoFiles([
					sheetFile("file1", "A", date2),
					sheetFile("file2", "B", date1),
				]);

				consolidateData({
					folderId: "folder-id",
					sort: { key: "date", order: "desc" },
					source: { sheetName: "Data" },
					destination: {},
				});

				expect(destination.sheets[0].data).toEqual([
					["A", "from1"],
					["B", "from2"],
				]);
			});
		});
	});
});
