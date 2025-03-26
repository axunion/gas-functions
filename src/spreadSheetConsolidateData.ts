type SheetCell = number | string | boolean | Date | null | undefined;

/**
 * Consolidates data from all Google Sheets files within a specified folder.
 *
 * This function retrieves data from a specific sheet in each file located in the given folder.
 * It extracts data starting from a designated row and column in the source sheet and appends it
 * into the active sheet beginning at a specified destination cell.
 *
 * Output format:
 * - Column A: Source file name.
 * - Columns B onward: Data extracted from the source sheet.
 *
 * @param {object} params - Parameters for consolidation.
 * @param {string} params.folderId - The ID of the folder containing the files.
 * @param {"name" | "date"} [params.sortKey="name"] - The key to sort files: "name" for file name, "date" for last updated date.
 * @param {"asc" | "desc"} [params.sortOrder="asc"] - The sort order: "asc" for ascending, "desc" for descending.
 * @param {string} params.sourceSheetName - The name of the sheet from which data is extracted.
 * @param {number} params.sourceStartRow - The starting row (1-indexed) for data extraction in the source sheet.
 * @param {number} params.sourceStartColumn - The starting column (1-indexed) for data extraction in the source sheet.
 * @param {number} params.destinationStartRow - The starting row (1-indexed) in the active sheet for writing data.
 * @param {number} params.destinationStartColumn - The starting column (1-indexed) in the active sheet for writing data.
 * @param {number[]} [params.requiredColumns] - Optional array of column numbers (1-indexed relative to the extracted data)
 *   that must contain a value. If any of these cells are empty, the row is skipped.
 */
function consolidateDataWithParams(params: {
	folderId: string;
	sortKey?: "name" | "date";
	sortOrder?: "asc" | "desc";
	sourceSheetName: string;
	sourceStartRow: number;
	sourceStartColumn: number;
	destinationStartRow: number;
	destinationStartColumn: number;
	requiredColumns?: number[];
}): void {
	const {
		folderId,
		sortKey = "name",
		sortOrder = "asc",
		sourceSheetName,
		sourceStartRow,
		sourceStartColumn,
		destinationStartRow,
		destinationStartColumn,
		requiredColumns,
	} = params;

	// Validate that row and column values are positive integers.
	if (
		sourceStartRow < 1 ||
		sourceStartColumn < 1 ||
		destinationStartRow < 1 ||
		destinationStartColumn < 1
	) {
		throw new Error(
			"Error: Start row and column values must be positive integers.",
		);
	}

	// Get the active spreadsheet and destination sheet.
	const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	const destinationSheet = activeSpreadsheet.getActiveSheet();

	// Clear existing content from the destination range.
	const numRowsToClear =
		destinationSheet.getMaxRows() - destinationStartRow + 1;
	const numColumnsToClear =
		destinationSheet.getMaxColumns() - destinationStartColumn + 1;

	destinationSheet
		.getRange(
			destinationStartRow,
			destinationStartColumn,
			numRowsToClear,
			numColumnsToClear,
		)
		.clearContent();

	// Prepare an array to store consolidated data.
	const consolidatedData: SheetCell[][] = [];

	// Retrieve all files in the specified folder.
	let folder: GoogleAppsScript.Drive.Folder;

	try {
		folder = DriveApp.getFolderById(folderId);
	} catch (e) {
		throw new Error(`Error retrieving folder with ID "${folderId}": ${e}`);
	}

	// Collect files into an array.
	const files: GoogleAppsScript.Drive.File[] = [];
	const fileIterator = folder.getFiles();

	while (fileIterator.hasNext()) {
		files.push(fileIterator.next());
	}

	// Sort files using a single comparator.
	files.sort((a, b) => {
		let compareValue = 0;

		if (sortKey === "name") {
			compareValue = a.getName().localeCompare(b.getName());
		} else if (sortKey === "date") {
			compareValue =
				a.getLastUpdated().getTime() - b.getLastUpdated().getTime();
		}

		return sortOrder === "asc" ? compareValue : -compareValue;
	});

	// Process each file.
	for (const file of files) {
		// Only process Google Sheets files.
		if (file.getMimeType() !== "application/vnd.google-apps.spreadsheet") {
			continue;
		}

		try {
			const ss = SpreadsheetApp.open(file);
			const sourceSheet = ss.getSheetByName(sourceSheetName);

			if (!sourceSheet) {
				throw new Error(
					`File "${file.getName()}" does not contain sheet "${sourceSheetName}".`,
				);
			}

			// Determine the range dimensions.
			const sourceLastRow = sourceSheet.getLastRow();
			const sourceLastColumn = sourceSheet.getLastColumn();
			const numRows = sourceLastRow - sourceStartRow + 1;
			const numColumns = sourceLastColumn - sourceStartColumn + 1;

			if (numRows <= 0 || numColumns <= 0) {
				throw new Error(
					`File "${file.getName()}" does not have data starting from row ${sourceStartRow} and column ${sourceStartColumn}.`,
				);
			}

			// Retrieve data from the source sheet.
			const data: SheetCell[][] = sourceSheet
				.getRange(sourceStartRow, sourceStartColumn, numRows, numColumns)
				.getValues();

			// Append each row to consolidated data if required columns are not empty.
			for (const row of data) {
				if (
					requiredColumns?.some(
						(col) =>
							col < 1 ||
							col > row.length ||
							row[col - 1] === "" ||
							row[col - 1] == null,
					)
				) {
					continue;
				}

				consolidatedData.push([file.getName(), ...row]);
			}
		} catch (error) {
			throw new Error(`Error processing file "${file.getName()}": ${error}`);
		}
	}

	// Write consolidated data to the destination sheet.
	if (consolidatedData.length > 0) {
		try {
			destinationSheet
				.getRange(
					destinationStartRow,
					destinationStartColumn,
					consolidatedData.length,
					consolidatedData[0].length,
				)
				.setValues(consolidatedData);
		} catch (e) {
			throw new Error(
				`Error writing consolidated data to the destination sheet: ${e}`,
			);
		}
	} else {
		throw new Error(
			"No data was consolidated. Please check if the source sheets contain data.",
		);
	}
}
