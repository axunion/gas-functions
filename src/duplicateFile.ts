/**
 * Creates a duplicate of a file in a specified Google Drive folder with a new name.
 *
 * @param params - Parameters for duplicating the file.
 * @param params.fileId - The ID of the file to duplicate. Must not be empty.
 * @param params.directoryId - The ID of the Google Drive folder where the duplicate will be created. Must not be empty.
 * @param params.name - The name for the new duplicated file. Must not be empty.
 * @returns The Google Apps Script Drive File object representing the duplicated file.
 * @throws Error if a parameter is empty, or if DriveApp fails (file/folder not found, insufficient permissions, etc.).
 */
function duplicateFile(params: {
	fileId: string;
	directoryId: string;
	name: string;
}): GoogleAppsScript.Drive.File {
	const { fileId, directoryId, name } = params;

	if (!fileId.trim()) {
		throw new Error(
			"Source file ID is required and must be a non-empty string.",
		);
	}

	if (!directoryId.trim()) {
		throw new Error(
			"Target directory ID is required and must be a non-empty string.",
		);
	}

	if (!name.trim()) {
		throw new Error(
			"New file name is required and must be a non-empty string.",
		);
	}

	const file = DriveApp.getFileById(fileId);
	const folder = DriveApp.getFolderById(directoryId);

	return file.makeCopy(name, folder);
}

export { duplicateFile };
