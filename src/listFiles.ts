/**
 * Lists files in a Google Drive folder, sorted by name or date.
 *
 * @param params - Parameters for listing files.
 * @param params.folderId - The ID of the Google Drive folder. Must not be empty.
 * @param params.sortKey - The key to sort by: 'name' for file name or 'date' for last updated date. Defaults to 'name'.
 * @param params.sortOrder - The order to sort: 'asc' for ascending or 'desc' for descending. Defaults to 'asc'.
 * @returns An array of tuples, where each tuple contains the file name and its last updated date. Returns an empty array if the folder contains no files.
 * @throws Error if folderId is empty, or if DriveApp fails (folder not found, no access, etc.).
 */
function listFiles(params: {
	folderId: string;
	sortKey?: "name" | "date";
	sortOrder?: "asc" | "desc";
}): Array<[string, GoogleAppsScript.Base.Date]> {
	const { folderId, sortKey = "name", sortOrder = "asc" } = params;

	if (!folderId.trim()) {
		throw new Error("Folder ID is required and must be a non-empty string.");
	}

	const files = DriveApp.getFolderById(folderId).getFiles();
	const fileList: Array<[string, GoogleAppsScript.Base.Date]> = [];

	while (files.hasNext()) {
		const file = files.next();
		fileList.push([file.getName(), file.getLastUpdated()]);
	}

	fileList.sort((a, b) => {
		const value =
			sortKey === "name"
				? a[0].localeCompare(b[0])
				: a[1].getTime() - b[1].getTime();
		return sortOrder === "asc" ? value : -value;
	});

	return fileList;
}

export { listFiles };
