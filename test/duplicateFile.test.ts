import { beforeEach, describe, expect, it, vi } from "vitest";
import { duplicateFile } from "../src/duplicateFile";
import { mockDriveApp, setupDriveApp } from "./mocks";

beforeEach(() => {
	setupDriveApp({
		files: {
			"source-file-id": { id: "source-file-id", name: "template.docx" },
		},
		folders: {
			"target-folder-id": { id: "target-folder-id", name: "Target Folder" },
		},
	});
	vi.clearAllMocks();
});

describe("duplicateFile", () => {
	describe("validation", () => {
		it("throws if fileId is empty", () => {
			expect(() =>
				duplicateFile({
					fileId: "",
					directoryId: "target-folder-id",
					name: "copy.docx",
				}),
			).toThrow("Source file ID is required and must be a non-empty string.");
		});

		it("throws if fileId is whitespace only", () => {
			expect(() =>
				duplicateFile({
					fileId: "   ",
					directoryId: "target-folder-id",
					name: "copy.docx",
				}),
			).toThrow("Source file ID is required and must be a non-empty string.");
		});

		it("throws if directoryId is empty", () => {
			expect(() =>
				duplicateFile({
					fileId: "source-file-id",
					directoryId: "",
					name: "copy.docx",
				}),
			).toThrow(
				"Target directory ID is required and must be a non-empty string.",
			);
		});

		it("throws if directoryId is whitespace only", () => {
			expect(() =>
				duplicateFile({
					fileId: "source-file-id",
					directoryId: "   ",
					name: "copy.docx",
				}),
			).toThrow(
				"Target directory ID is required and must be a non-empty string.",
			);
		});

		it("throws if name is empty", () => {
			expect(() =>
				duplicateFile({
					fileId: "source-file-id",
					directoryId: "target-folder-id",
					name: "",
				}),
			).toThrow("New file name is required and must be a non-empty string.");
		});

		it("throws if name is whitespace only", () => {
			expect(() =>
				duplicateFile({
					fileId: "source-file-id",
					directoryId: "   ",
					name: "   ",
				}),
			).toThrow(
				"Target directory ID is required and must be a non-empty string.",
			);
		});
	});

	describe("successful duplication", () => {
		it("duplicates file to target folder with new name", () => {
			const result = duplicateFile({
				fileId: "source-file-id",
				directoryId: "target-folder-id",
				name: "my-copy.docx",
			});

			expect(mockDriveApp.getFileById).toHaveBeenCalledWith("source-file-id");
			expect(mockDriveApp.getFolderById).toHaveBeenCalledWith(
				"target-folder-id",
			);
			expect(result.getName()).toBe("my-copy.docx");
			expect(result.getId()).toBe("copy-source-file-id");
		});
	});

	describe("error handling", () => {
		it("throws if source file is not found", () => {
			expect(() =>
				duplicateFile({
					fileId: "non-existent-file",
					directoryId: "target-folder-id",
					name: "copy.docx",
				}),
			).toThrow('Failed to retrieve source file with ID "non-existent-file"');
		});

		it("throws if target folder is not found", () => {
			expect(() =>
				duplicateFile({
					fileId: "source-file-id",
					directoryId: "non-existent-folder",
					name: "copy.docx",
				}),
			).toThrow(
				'Failed to retrieve target folder with ID "non-existent-folder"',
			);
		});

		it("throws if makeCopy fails", () => {
			// Override getFileById to return a file with failing makeCopy
			mockDriveApp.getFileById.mockImplementation((id: string) => {
				if (id === "source-file-id") {
					return {
						getId: () => "source-file-id",
						getName: () => "template.docx",
						getMimeType: () => "application/octet-stream",
						getLastUpdated: () => new Date(),
						makeCopy: vi.fn(() => {
							throw new Error("Insufficient permissions");
						}),
						setName: vi.fn(),
					} as unknown as GoogleAppsScript.Drive.File;
				}
				throw new Error(`File not found: ${id}`);
			});

			expect(() =>
				duplicateFile({
					fileId: "source-file-id",
					directoryId: "target-folder-id",
					name: "copy.docx",
				}),
			).toThrow('Failed to duplicate file "template.docx"');
		});
	});
});
