/**
 * Lists files in a Google Drive folder, sorted by name or date.
 *
 * @param params - Parameters for listing files.
 * @param params.folderId - The ID of the Google Drive folder. Must not be empty.
 * @param params.sortKey - The key to sort by: 'name' for file name or 'date' for last updated date. Defaults to 'name'.
 * @param params.sortOrder - The order to sort: 'asc' for ascending or 'desc' for descending. Defaults to 'asc'.
 * @returns An array of tuples, where each tuple contains the file name and its last updated date. Returns an empty array if the folder is not found or inaccessible, or contains no files.
 * @throws Error if folderId is empty or if an unexpected error occurs during DriveApp operations.
 * @customfunction
 */
function listFiles(params: {
	folderId: string;
	sortKey?: "name" | "date";
	sortOrder?: "asc" | "desc";
}): Array<[string, GoogleAppsScript.Base.Date]> {
	const { folderId, sortKey = "name", sortOrder = "asc" } = params;

	if (!folderId || typeof folderId !== "string" || folderId.trim() === "") {
		throw new Error("Folder ID is required and must be a non-empty string.");
	}

	let folder: GoogleAppsScript.Drive.Folder;

	try {
		folder = DriveApp.getFolderById(folderId);
	} catch (e: unknown) {
		// If getFolderById throws (e.g., invalid ID, no access), log and return empty array as per JSDoc.
		const message = e instanceof Error ? e.message : String(e);
		console.warn(`Could not retrieve folder with ID "${folderId}": ${message}`);
		return [];
	}

	const files = folder.getFiles();
	const fileList: Array<[string, GoogleAppsScript.Base.Date]> = [];

	// Loop through each file and add a [file name, last updated date] pair to the list.
	while (files.hasNext()) {
		const file = files.next();
		fileList.push([file.getName(), file.getLastUpdated()]);
	}

	// Sort fileList based on sortKey.
	fileList.sort((a, b) => {
		if (sortKey === "name") {
			return a[0].localeCompare(b[0]);
		}
		// sortKey === "date"
		return a[1].getTime() - b[1].getTime();
	});

	// If sortOrder is "desc", reverse the sorted list.
	return sortOrder === "asc" ? fileList : fileList.reverse();
}

export { listFiles };
