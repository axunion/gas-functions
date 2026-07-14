/**
 * Saves an image to a specified Google Drive folder.
 *
 * @param params - Parameters for saving the image.
 * @param params.image - The image blob source to save.
 * @param params.fileName - The desired name for the saved file. Must not be empty.
 * @param params.folderId - The ID of the Google Drive folder where the image will be saved. Must not be empty.
 * @returns The Google Apps Script Drive File object representing the saved image.
 * @throws Error if folderId or fileName is empty, or if DriveApp fails (folder not found, quota exceeded, etc.).
 */
function saveImage(params: {
	image: GoogleAppsScript.Base.BlobSource;
	fileName: string;
	folderId: string;
}): GoogleAppsScript.Drive.File {
	const { image, fileName, folderId } = params;

	if (!folderId.trim()) {
		throw new Error("Folder ID is required and must be a non-empty string.");
	}

	if (!fileName.trim()) {
		throw new Error("File name is required and must be a non-empty string.");
	}

	const folder = DriveApp.getFolderById(folderId);

	return folder.createFile(image).setName(fileName);
}

export { saveImage };
