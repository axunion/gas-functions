import { beforeEach, describe, expect, it, vi } from "vitest";
import { duplicateFile } from "../src/duplicateFile";
import { mockDriveApp, setupDriveApp } from "./mocks";

beforeEach(() => {
	vi.clearAllMocks();
	setupDriveApp({
		files: {
			"source-file-id": { id: "source-file-id", name: "template.docx" },
		},
		folders: {
			"target-folder-id": { id: "target-folder-id", name: "Target Folder" },
		},
	});
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
					directoryId: "target-folder-id",
					name: "   ",
				}),
			).toThrow("New file name is required and must be a non-empty string.");
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
		it("propagates the DriveApp error if source file is not found", () => {
			expect(() =>
				duplicateFile({
					fileId: "non-existent-file",
					directoryId: "target-folder-id",
					name: "copy.docx",
				}),
			).toThrow("File not found: non-existent-file");
		});

		it("propagates the DriveApp error if target folder is not found", () => {
			expect(() =>
				duplicateFile({
					fileId: "source-file-id",
					directoryId: "non-existent-folder",
					name: "copy.docx",
				}),
			).toThrow("Folder not found: non-existent-folder");
		});

		it("propagates the DriveApp error if makeCopy fails", () => {
			mockDriveApp.getFileById.mockImplementation(
				() =>
					({
						getId: () => "source-file-id",
						getName: () => "template.docx",
						makeCopy: vi.fn(() => {
							throw new Error("Insufficient permissions");
						}),
					}) as unknown as GoogleAppsScript.Drive.File,
			);

			expect(() =>
				duplicateFile({
					fileId: "source-file-id",
					directoryId: "target-folder-id",
					name: "copy.docx",
				}),
			).toThrow("Insufficient permissions");
		});
	});
});
