/**
 * Creates a duplicate of a file in a specified Google Drive folder with a new name.
 *
 * @param params - Parameters for duplicating the file.
 * @param params.fileId - The ID of the file to duplicate. Must not be empty.
 * @param params.directoryId - The ID of the Google Drive folder where the duplicate will be created. Must not be empty.
 * @param params.name - The name for the new duplicated file. Must not be empty.
 * @returns The Google Apps Script Drive File object representing the duplicated file.
 * @throws Error if `fileId`, `directoryId`, or `name` is empty, if the original file or target folder is not found or inaccessible, or if there is an error during the duplication process (e.g., naming conflict, insufficient permissions).
 */
function duplicateFile(params: {
	fileId: string;
	directoryId: string;
	name: string;
}): GoogleAppsScript.Drive.File {
	const { fileId, directoryId, name } = params;

	if (!fileId || typeof fileId !== "string" || fileId.trim() === "") {
		throw new Error(
			"Source file ID is required and must be a non-empty string.",
		);
	}

	if (
		!directoryId ||
		typeof directoryId !== "string" ||
		directoryId.trim() === ""
	) {
		throw new Error(
			"Target directory ID is required and must be a non-empty string.",
		);
	}
	if (!name || typeof name !== "string" || name.trim() === "") {
		throw new Error(
			"New file name is required and must be a non-empty string.",
		);
	}

	let templateFile: GoogleAppsScript.Drive.File;

	try {
		templateFile = DriveApp.getFileById(fileId);
	} catch (e) {
		throw new Error(
			`Failed to retrieve source file with ID "${fileId}". Original error: ${e.message}`,
		);
	}

	let targetFolder: GoogleAppsScript.Drive.Folder;

	try {
		targetFolder = DriveApp.getFolderById(directoryId);
	} catch (e) {
		throw new Error(
			`Failed to retrieve target folder with ID "${directoryId}". Original error: ${e.message}`,
		);
	}

	try {
		return templateFile.makeCopy(name, targetFolder);
	} catch (e) {
		throw new Error(
			`Failed to duplicate file "${templateFile.getName()}" (ID: "${fileId}") to folder "${targetFolder.getName()}" (ID: "${directoryId}") with new name "${name}". Original error: ${e.message}`,
		);
	}
}

export { duplicateFile };
