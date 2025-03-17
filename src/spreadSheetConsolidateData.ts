/**
 * Consolidate data from all Google Sheets files in a specified folder.
 * Retrieves values from a specified sheet in each file starting at a given row and column,
 * and appends them to a designated sheet in the active spreadsheet.
 * The output includes a sequential number in column A and the source file name in column B.
 */
function consolidateData(): void {
	// Folder ID to target
	const folderId = "";
	// Sheet name to retrieve data from in external files
	const sourceSheetName = "";
	// Destination sheet name in the active spreadsheet (if not exists, it will be created)
	const destinationSheetName = "";
	// Starting row (1-indexed) in the source sheet to begin data extraction (skip header rows)
	const sourceStartRow = 2;
	// Starting column (1-indexed) in the source sheet to begin data extraction (skip serial number column)
	const sourceStartColumn = 2;

	const destinationSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	let destinationSheet =
		destinationSpreadsheet.getSheetByName(destinationSheetName);

	if (!destinationSheet) {
		destinationSheet = destinationSpreadsheet.insertSheet(destinationSheetName);
	}

	const folder = DriveApp.getFolderById(folderId);
	const files = folder.getFiles();
	const consolidatedData: unknown[][] = [];
	let seqCounter = 1;

	while (files.hasNext()) {
		const file = files.next();

		if (file.getMimeType() === "application/vnd.google-apps.spreadsheet") {
			const ss = SpreadsheetApp.open(file);
			const sourceSheet = ss.getSheetByName(sourceSheetName);
			if (!sourceSheet) {
				Logger.log(
					`File "${file.getName()}" does not contain sheet "${sourceSheetName}".`,
				);
				continue;
			}

			// Calculate the number of rows and columns to retrieve from the source sheet
			const lastRow = sourceSheet.getLastRow();
			const lastColumn = sourceSheet.getLastColumn();
			const numRows = lastRow - sourceStartRow + 1;
			const numColumns = lastColumn - sourceStartColumn + 1;

			// If there's no data to retrieve, skip this file
			if (numRows <= 0 || numColumns <= 0) {
				Logger.log(
					`File "${file.getName()}" does not have data starting from row ${sourceStartRow} and column ${sourceStartColumn}.`,
				);
				continue;
			}

			// Get the data range from the specified starting row and column
			const data = sourceSheet
				.getRange(sourceStartRow, sourceStartColumn, numRows, numColumns)
				.getValues();

			// Append each row to the consolidated data array with a sequential number and file name
			for (let i = 0; i < data.length; i++) {
				const rowData = data[i];
				consolidatedData.push([seqCounter, file.getName(), ...rowData]);
				seqCounter++;
			}
		} else {
			Logger.log(`File "${file.getName()}" is not a Google Sheets file.`);
		}
	}

	// Write the consolidated data to the destination sheet if there is any data
	if (consolidatedData.length > 0) {
		destinationSheet
			.getRange(2, 1, consolidatedData.length, consolidatedData[0].length)
			.setValues(consolidatedData);
	}
}
