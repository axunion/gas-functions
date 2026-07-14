import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveImage } from "../src/saveImage";
import { mockDriveApp, setupDriveApp } from "./mocks";

const createMockBlob = (): GoogleAppsScript.Base.BlobSource =>
	({
		getBlob: vi.fn(),
		getAs: vi.fn(),
	}) as unknown as GoogleAppsScript.Base.BlobSource;

beforeEach(() => {
	vi.clearAllMocks();
	setupDriveApp({
		folders: {
			"folder-id": { id: "folder-id", name: "Images Folder" },
		},
	});
});

describe("saveImage", () => {
	describe("validation", () => {
		it("throws if folderId is empty", () => {
			expect(() =>
				saveImage({
					image: createMockBlob(),
					fileName: "test.png",
					folderId: "",
				}),
			).toThrow("Folder ID is required and must be a non-empty string.");
		});

		it("throws if folderId is whitespace only", () => {
			expect(() =>
				saveImage({
					image: createMockBlob(),
					fileName: "test.png",
					folderId: "   ",
				}),
			).toThrow("Folder ID is required and must be a non-empty string.");
		});

		it("throws if fileName is empty", () => {
			expect(() =>
				saveImage({
					image: createMockBlob(),
					fileName: "",
					folderId: "folder-id",
				}),
			).toThrow("File name is required and must be a non-empty string.");
		});

		it("throws if fileName is whitespace only", () => {
			expect(() =>
				saveImage({
					image: createMockBlob(),
					fileName: "   ",
					folderId: "folder-id",
				}),
			).toThrow("File name is required and must be a non-empty string.");
		});
	});

	describe("successful save", () => {
		it("saves image to folder with specified name", () => {
			const result = saveImage({
				image: createMockBlob(),
				fileName: "my-image.png",
				folderId: "folder-id",
			});

			expect(mockDriveApp.getFolderById).toHaveBeenCalledWith("folder-id");
			expect(result.setName).toHaveBeenCalledWith("my-image.png");
		});
	});

	describe("error handling", () => {
		it("propagates the DriveApp error if folder is not found", () => {
			expect(() =>
				saveImage({
					image: createMockBlob(),
					fileName: "test.png",
					folderId: "non-existent-folder",
				}),
			).toThrow("Folder not found: non-existent-folder");
		});

		it("propagates the DriveApp error if createFile fails", () => {
			mockDriveApp.getFolderById.mockImplementation(
				() =>
					({
						getId: () => "folder-id",
						getName: () => "Images Folder",
						createFile: vi.fn(() => {
							throw new Error("Quota exceeded");
						}),
					}) as unknown as GoogleAppsScript.Drive.Folder,
			);

			expect(() =>
				saveImage({
					image: createMockBlob(),
					fileName: "test.png",
					folderId: "folder-id",
				}),
			).toThrow("Quota exceeded");
		});
	});
});
