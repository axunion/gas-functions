function spreadSheetMergeFromFolder() {
	const FOLDER_ID = "";
	const TARGET_FILE_ID = "";
	const TARGET_SHEET_NAME = "";
	const COLUMN_NUMBERS = [2, 4];
	const START_ROW = 1;

	if (!FOLDER_ID || !TARGET_FILE_ID) {
		throw new Error("Folder ID or File ID is not set.");
	}

	if (COLUMN_NUMBERS.some((col) => col < 1) || START_ROW < 1) {
		throw new Error("Column numbers and start row must be at least 1.");
	}

	let folder: GoogleAppsScript.Drive.Folder;
	let targetSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

	try {
		folder = DriveApp.getFolderById(FOLDER_ID);
		targetSpreadsheet = SpreadsheetApp.openById(TARGET_FILE_ID);
	} catch (e) {
		SpreadsheetApp.getUi().alert(
			`Failed to retrieve folder or spreadsheet: ${e.message}`,
		);
		return;
	}

	const targetSheet = targetSpreadsheet.getSheetByName(TARGET_SHEET_NAME);

	if (!targetSheet) {
		SpreadsheetApp.getUi().alert(
			`Target sheet with name '${TARGET_SHEET_NAME}' not found.`,
		);
		return;
	}

	// Get all Google Sheets files in the folder.
	const files = folder.getFilesByType(
		"application/vnd.google-apps.spreadsheet",
	);

	let currentRow = START_ROW;
	let totalRowsMerged = 0;
	const processedFiles: string[] = [];
	const errorFiles: { file: string; column?: number; error: string }[] = [];

	// Alert if no Google Sheets files are found in the folder.
	if (!files.hasNext()) {
		SpreadsheetApp.getUi().alert(
			"No Google Sheets files found in the specified folder.",
		);
		return;
	}

	// Process each file in the folder.
	while (files.hasNext()) {
		const file = files.next();
		let spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

		try {
			// Attempt to open the spreadsheet file.
			spreadsheet = SpreadsheetApp.open(file);
		} catch (e) {
			Logger.log(`Failed to open file '${file.getName()}': ${e.message}`);
			errorFiles.push({ file: file.getName(), error: e.message });
			continue;
		}
		// Use the active sheet of the current spreadsheet file.
		const sheet = spreadsheet.getActiveSheet();
		const lastRow = sheet.getLastRow();
		const numRows = lastRow - START_ROW + 1;

		// Skip the file if there is no data starting from the specified start row.
		if (numRows <= 0) {
			Logger.log(
				`File '${file.getName()}' has no data starting from row ${START_ROW}.`,
			);
			continue;
		}

		// Loop through each specified column and copy its data to the target sheet.
		for (const columnNumber of COLUMN_NUMBERS) {
			try {
				const data = sheet
					.getRange(START_ROW, columnNumber, numRows, 1)
					.getValues();
				targetSheet
					.getRange(currentRow, columnNumber, numRows, 1)
					.setValues(data);
			} catch (e) {
				Logger.log(
					`Error processing column ${columnNumber} in file '${file.getName()}': ${e.message}`,
				);
				errorFiles.push({
					file: file.getName(),
					column: columnNumber,
					error: e.message,
				});
			}
		}

		// Update current row position and total rows merged.
		currentRow += numRows;
		totalRowsMerged += numRows;
		processedFiles.push(file.getName());
	}

	// Log summary of processed files and any errors encountered.
	Logger.log(`Processed files: ${processedFiles.join(", ")}`);
	if (errorFiles.length > 0) {
		for (const err of errorFiles) {
			Logger.log(
				`Error in file '${err.file}' (column ${err.column || "N/A"}): ${err.error}`,
			);
		}
	}

	SpreadsheetApp.getUi().alert(
		`Process completed. Total rows merged: ${totalRowsMerged}`,
	);
}
