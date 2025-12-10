import { vi } from "vitest";

export interface MockFile {
	id: string;
	name: string;
	mimeType?: string;
	lastUpdated?: Date;
}

export interface MockFolder {
	id: string;
	name: string;
	files?: MockFile[];
}

/** Create a mock File object */
export const createMockFile = (file: MockFile): GoogleAppsScript.Drive.File => {
	const mockFile = {
		getId: () => file.id,
		getName: () => file.name,
		getMimeType: () => file.mimeType || "application/octet-stream",
		getLastUpdated: () =>
			(file.lastUpdated || new Date()) as GoogleAppsScript.Base.Date,
		makeCopy: vi.fn(
			(newName: string, _folder?: GoogleAppsScript.Drive.Folder) =>
				createMockFile({ id: `copy-${file.id}`, name: newName }),
		),
		setName: vi.fn(function (
			this: GoogleAppsScript.Drive.File,
			_newName: string,
		) {
			return this;
		}),
	} as unknown as GoogleAppsScript.Drive.File;
	return mockFile;
};

/** Create a mock file iterator */
const createMockFileIterator = (
	files: MockFile[],
): GoogleAppsScript.Drive.FileIterator => {
	let index = 0;
	return {
		hasNext: () => index < files.length,
		next: () => createMockFile(files[index++]),
		getContinuationToken: () => "",
	} as GoogleAppsScript.Drive.FileIterator;
};

/** Create a mock Folder object */
export const createMockFolder = (
	folder: MockFolder,
): GoogleAppsScript.Drive.Folder =>
	({
		getId: () => folder.id,
		getName: () => folder.name,
		getFiles: () => createMockFileIterator(folder.files || []),
		createFile: vi.fn((_blob: GoogleAppsScript.Base.BlobSource) =>
			createMockFile({ id: "new-file-id", name: "new-file" }),
		),
	}) as unknown as GoogleAppsScript.Drive.Folder;

export interface MockDriveAppConfig {
	files?: Record<string, MockFile>;
	folders?: Record<string, MockFolder>;
}

export const createMockDriveApp = (config: MockDriveAppConfig = {}) => ({
	getFileById: vi.fn((id: string) => {
		const file = config.files?.[id];
		if (!file) {
			throw new Error(`File not found: ${id}`);
		}
		return createMockFile(file);
	}),
	getFolderById: vi.fn((id: string) => {
		const folder = config.folders?.[id];
		if (!folder) {
			throw new Error(`Folder not found: ${id}`);
		}
		return createMockFolder(folder);
	}),
});

export let mockDriveApp: ReturnType<typeof createMockDriveApp>;

export const setupDriveApp = (config: MockDriveAppConfig = {}) => {
	mockDriveApp = createMockDriveApp(config);
	(globalThis as unknown as { DriveApp: typeof mockDriveApp }).DriveApp =
		mockDriveApp;
};
