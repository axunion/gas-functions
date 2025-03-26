/**
 * Returns an array of pairs [fileName, lastUpdated] for all files in the specified folder,
 * sorted by the given key and order.
 *
 * This custom function retrieves all files from a Google Drive folder (using folderId)
 * and returns an array of pairs where each pair consists of the file name and its last updated date.
 * The result is sorted by either file name or updated date, in ascending or descending order.
 *
 * @param {object} params - Parameters for listing files.
 * @param {string} params.folderId - The ID of the Google Drive folder.
 * @param {"name" | "date"} [params.sortKey="name"] - The key to sort by: 'name' for file name or 'date' for updated date.
 * @param {"asc" | "desc"} [params.sortOrder="asc"] - The order to sort: 'asc' for ascending or 'desc' for descending.
 * @returns {Array<[string, GoogleAppsScript.Base.Date]>} An array of pairs where each pair contains the file name and the last updated date.
 * @customfunction
 */
function listFiles(params: {
	folderId: string;
	sortKey: "name" | "date";
	sortOrder: "asc" | "desc";
}): Array<[string, GoogleAppsScript.Base.Date]> {
	const { folderId, sortKey = "name", sortOrder = "asc" } = params;

	if (!folderId) {
		throw new Error("Folder ID is required.");
	}

	try {
		const folder = DriveApp.getFolderById(folderId);
		const files = folder.getFiles();
		const fileList: Array<[string, GoogleAppsScript.Base.Date]> = [];

		// Loop through each file and add a [file name, last updated date] pair to the list.
		while (files.hasNext()) {
			const file = files.next();
			fileList.push([file.getName(), file.getLastUpdated()]);
		}

		// Sort fileList in ascending order based on sortKey.
		fileList.sort((a, b) =>
			sortKey === "name"
				? a[0].localeCompare(b[0])
				: a[1].getTime() - b[1].getTime(),
		);

		// If sortOrder is "desc", reverse the sorted list.
		return sortOrder === "asc" ? fileList : fileList.reverse();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error retrieving files: ${error.message}`);
		}

		throw new Error("Unknown error retrieving files.");
	}
}
