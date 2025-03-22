/**
 * Returns an array of pairs [fileName, fileId] for all files in the specified directory.
 */
function listFiles(directoryId: string): string[][] {
	if (!directoryId) {
		throw new Error("Directory ID is required.");
	}

	try {
		const folder = DriveApp.getFolderById(directoryId);
		const files = folder.getFiles();
		const fileList: string[][] = [];

		while (files.hasNext()) {
			const file = files.next();
			// Push a pair [file name, file ID] into the array
			fileList.push([file.getName(), file.getId()]);
		}

		return fileList;
	} catch (error) {
		throw new Error(`Error retrieving files: ${error}`);
	}
}
