/**
 * Creates a duplicate of a file in a specified folder with a new name.
 */
function duplicateFile(params: {
	fileId: string;
	directoryId: string;
	name: string;
}): GoogleAppsScript.Drive.File {
	const { fileId, directoryId, name } = params;

	let templateFile: GoogleAppsScript.Drive.File;

	try {
		templateFile = DriveApp.getFileById(fileId);
	} catch (error) {
		throw new Error(`Failed to retrieve file with id "${fileId}": ${error}`);
	}

	let targetFolder: GoogleAppsScript.Drive.Folder;

	try {
		targetFolder = DriveApp.getFolderById(directoryId);
	} catch (error) {
		throw new Error(
			`Failed to retrieve folder with id "${directoryId}": ${error}`,
		);
	}

	let copiedFile: GoogleAppsScript.Drive.File;

	try {
		copiedFile = templateFile.makeCopy(name, targetFolder);
	} catch (error) {
		throw new Error(`Failed to duplicate file: ${error}`);
	}

	return copiedFile;
}

export { duplicateFile };
