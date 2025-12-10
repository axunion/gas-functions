import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveImage } from "../src/saveImage";
import { mockDriveApp, setupDriveApp } from "./mocks";

const createMockBlob = (): GoogleAppsScript.Base.BlobSource => ({
	getAs: vi.fn(),
	getBlob: vi.fn(),
	getBytes: vi.fn(() => []),
	getContentType: vi.fn(() => "image/png"),
	getDataAsString: vi.fn(() => ""),
	getName: vi.fn(() => "test.png"),
	isGoogleType: vi.fn(() => false),
	setBytes: vi.fn(),
	setContentType: vi.fn(),
	setContentTypeFromExtension: vi.fn(),
	setDataFromString: vi.fn(),
	setName: vi.fn(),
});

beforeEach(() => {
	setupDriveApp({
		folders: {
			"folder-id": { id: "folder-id", name: "Images Folder" },
		},
	});
	vi.clearAllMocks();
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

		it("throws if image is null", () => {
			expect(() =>
				saveImage({
					image: null as unknown as GoogleAppsScript.Base.BlobSource,
					fileName: "test.png",
					folderId: "folder-id",
				}),
			).toThrow("Image data (BlobSource) is required.");
		});

		it("throws if image is undefined", () => {
			expect(() =>
				saveImage({
					image: undefined as unknown as GoogleAppsScript.Base.BlobSource,
					fileName: "test.png",
					folderId: "folder-id",
				}),
			).toThrow("Image data (BlobSource) is required.");
		});
	});

	describe("successful save", () => {
		it("saves image to folder with specified name", () => {
			const blob = createMockBlob();

			const result = saveImage({
				image: blob,
				fileName: "my-image.png",
				folderId: "folder-id",
			});

			expect(mockDriveApp.getFolderById).toHaveBeenCalledWith("folder-id");
			expect(result).toBeDefined();
			expect(result.getId()).toBeDefined();
		});
	});

	describe("error handling", () => {
		it("throws if folder is not found", () => {
			expect(() =>
				saveImage({
					image: createMockBlob(),
					fileName: "test.png",
					folderId: "non-existent-folder",
				}),
			).toThrow(
				'Folder not found or inaccessible with ID "non-existent-folder"',
			);
		});

		it("throws if createFile fails", () => {
			// Override getFolderById to return a folder with failing createFile
			mockDriveApp.getFolderById.mockImplementation((id: string) => {
				if (id === "folder-id") {
					return {
						getId: () => "folder-id",
						getName: () => "Images Folder",
						getFiles: () => ({ hasNext: () => false, next: vi.fn() }),
						createFile: vi.fn(() => {
							throw new Error("Quota exceeded");
						}),
					} as unknown as GoogleAppsScript.Drive.Folder;
				}
				throw new Error(`Folder not found: ${id}`);
			});

			expect(() =>
				saveImage({
					image: createMockBlob(),
					fileName: "test.png",
					folderId: "folder-id",
				}),
			).toThrow('Error saving image "test.png" to folder ID "folder-id"');
		});
	});
});
