type DuplicateTemplateFileParams = {
	spreadsheetId: string;
	directoryId: string;
	name: string;
};

function duplicateTemplateFile(
	params: DuplicateTemplateFileParams,
): GoogleAppsScript.Drive.File {
	const { spreadsheetId, directoryId, name } = params;
	const templateFile = DriveApp.getFileById(spreadsheetId);
	const targetFolder = DriveApp.getFolderById(directoryId);
	const copiedFile = templateFile.makeCopy(name, targetFolder);

	return copiedFile;
}
