/**
 * Creates a duplicate of a file in a specified folder with a new name.
 */
function duplicateFile(params: {
	fileId: string;
	directoryId: string;
	name: string;
}): GoogleAppsScript.Drive.File {
	const { fileId, directoryId, name } = params;
	const templateFile = DriveApp.getFileById(fileId);
	const targetFolder = DriveApp.getFolderById(directoryId);
	const copiedFile = templateFile.makeCopy(name, targetFolder);
	return copiedFile;
}
