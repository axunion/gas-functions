type DuplicateFileParams = {
	fileId: string;
	directoryId: string;
	name: string;
};

function duplicateFile(
	params: DuplicateFileParams,
): GoogleAppsScript.Drive.File {
	const { fileId, directoryId, name } = params;
	const templateFile = DriveApp.getFileById(fileId);
	const targetFolder = DriveApp.getFolderById(directoryId);
	const copiedFile = templateFile.makeCopy(name, targetFolder);

	return copiedFile;
}
