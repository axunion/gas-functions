/**
 * Saves an image to a specified Google Drive directory.
 */
function saveImage({
	image,
	fileName,
	folderId,
}: {
	image: GoogleAppsScript.Base.BlobSource;
	fileName: string;
	folderId: string;
}): GoogleAppsScript.Drive.File {
	// Attempt to retrieve the folder using the provided directory ID.
	let folder: GoogleAppsScript.Drive.Folder;

	try {
		folder = DriveApp.getFolderById(folderId);
	} catch (error) {
		throw new Error("Directory not found with the provided ID.");
	}

	// Attempt to create and save the file in the target folder.
	let file: GoogleAppsScript.Drive.File;

	try {
		file = folder.createFile(image).setName(fileName);
	} catch (error) {
		throw new Error("Error saving the image to the specified directory.");
	}

	return file;
}
