import { beforeEach, describe, expect, it, vi } from "vitest";
import { listFiles } from "../src/listFiles";
import { setupDriveApp } from "./mocks";

const date1 = new Date("2024-01-01T10:00:00Z");
const date2 = new Date("2024-01-02T10:00:00Z");
const date3 = new Date("2024-01-03T10:00:00Z");

beforeEach(() => {
	vi.clearAllMocks();
});

describe("listFiles", () => {
	describe("validation", () => {
		it("throws if folderId is empty", () => {
			setupDriveApp({});

			expect(() => listFiles({ folderId: "" })).toThrow(
				"Folder ID is required and must be a non-empty string.",
			);
		});

		it("throws if folderId is whitespace only", () => {
			setupDriveApp({});

			expect(() => listFiles({ folderId: "   " })).toThrow(
				"Folder ID is required and must be a non-empty string.",
			);
		});
	});

	describe("successful listing", () => {
		it("returns empty array for empty folder", () => {
			setupDriveApp({
				folders: {
					"folder-id": { id: "folder-id", name: "Empty Folder", files: [] },
				},
			});

			const result = listFiles({ folderId: "folder-id" });

			expect(result).toEqual([]);
		});

		it("returns files sorted by name ascending by default", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [
							{ id: "3", name: "charlie.txt", lastUpdated: date1 },
							{ id: "1", name: "alpha.txt", lastUpdated: date2 },
							{ id: "2", name: "bravo.txt", lastUpdated: date3 },
						],
					},
				},
			});

			const result = listFiles({ folderId: "folder-id" });

			expect(result[0][0]).toBe("alpha.txt");
			expect(result[1][0]).toBe("bravo.txt");
			expect(result[2][0]).toBe("charlie.txt");
		});

		it("sorts by name descending", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [
							{ id: "1", name: "alpha.txt", lastUpdated: date1 },
							{ id: "2", name: "bravo.txt", lastUpdated: date1 },
							{ id: "3", name: "charlie.txt", lastUpdated: date1 },
						],
					},
				},
			});

			const result = listFiles({
				folderId: "folder-id",
				sortKey: "name",
				sortOrder: "desc",
			});

			expect(result[0][0]).toBe("charlie.txt");
			expect(result[1][0]).toBe("bravo.txt");
			expect(result[2][0]).toBe("alpha.txt");
		});

		it("sorts by date ascending", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [
							{ id: "3", name: "file3.txt", lastUpdated: date3 },
							{ id: "1", name: "file1.txt", lastUpdated: date1 },
							{ id: "2", name: "file2.txt", lastUpdated: date2 },
						],
					},
				},
			});

			const result = listFiles({
				folderId: "folder-id",
				sortKey: "date",
				sortOrder: "asc",
			});

			expect(result[0][0]).toBe("file1.txt");
			expect(result[1][0]).toBe("file2.txt");
			expect(result[2][0]).toBe("file3.txt");
		});

		it("sorts by date descending", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [
							{ id: "1", name: "file1.txt", lastUpdated: date1 },
							{ id: "2", name: "file2.txt", lastUpdated: date2 },
							{ id: "3", name: "file3.txt", lastUpdated: date3 },
						],
					},
				},
			});

			const result = listFiles({
				folderId: "folder-id",
				sortKey: "date",
				sortOrder: "desc",
			});

			expect(result[0][0]).toBe("file3.txt");
			expect(result[1][0]).toBe("file2.txt");
			expect(result[2][0]).toBe("file1.txt");
		});

		it("returns tuples with file name and last updated date", () => {
			setupDriveApp({
				folders: {
					"folder-id": {
						id: "folder-id",
						name: "Test Folder",
						files: [{ id: "1", name: "test.txt", lastUpdated: date1 }],
					},
				},
			});

			const result = listFiles({ folderId: "folder-id" });

			expect(result).toHaveLength(1);
			expect(result[0][0]).toBe("test.txt");
			expect(result[0][1]).toEqual(date1);
		});
	});

	describe("error handling", () => {
		it("propagates the DriveApp error if folder is not found", () => {
			setupDriveApp({ folders: {} });

			expect(() => listFiles({ folderId: "non-existent-folder" })).toThrow(
				"Folder not found: non-existent-folder",
			);
		});
	});
});
