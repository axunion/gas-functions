/**
 * Saves an image to a specified Google Drive folder.
 *
 * @param params - Parameters for saving the image.
 * @param params.image - The image blob source to save. Must be a valid BlobSource.
 * @param params.fileName - The desired name for the saved file. Must not be empty.
 * @param params.folderId - The ID of the Google Drive folder where the image will be saved. Must not be empty.
 * @returns The Google Apps Script Drive File object representing the saved image.
 * @throws Error if folderId or fileName is empty, if the folder is not found, or if there is an error during file creation or naming.
 */
function saveImage(params: {
	image: GoogleAppsScript.Base.BlobSource;
	fileName: string;
	folderId: string;
}): GoogleAppsScript.Drive.File {
	const { image, fileName, folderId } = params;

	if (!folderId || typeof folderId !== "string" || folderId.trim() === "") {
		throw new Error("Folder ID is required and must be a non-empty string.");
	}

	if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
		throw new Error("File name is required and must be a non-empty string.");
	}

	if (!image) {
		throw new Error("Image data (BlobSource) is required.");
	}

	let folder: GoogleAppsScript.Drive.Folder;

	try {
		folder = DriveApp.getFolderById(folderId);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : String(e);
		throw new Error(
			`Folder not found or inaccessible with ID "${folderId}". Original error: ${message}`,
		);
	}

	try {
		const file = folder.createFile(image);
		return file.setName(fileName);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : String(e);
		throw new Error(
			`Error saving image "${fileName}" to folder ID "${folderId}". Original error: ${message}`,
		);
	}
}

export { saveImage };
