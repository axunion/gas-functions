type SheetCell = number | string | boolean | Date | null | undefined;

/**
 * Consolidates data from multiple Google Sheets within a specified folder into the active sheet.
 *
 * @param params - Parameters for data consolidation.
 * @param params.folderId - The ID of the Google Drive folder containing the source spreadsheets.
 * @param params.sort - Optional sorting parameters for the files within the folder.
 * @param params.sort.key - Key to sort files by: 'name' or 'date'. Defaults to 'name'.
 * @param params.sort.order - Sort order: 'asc' or 'desc'. Defaults to 'asc'.
 * @param params.source - Parameters defining the source data to extract from each sheet.
 * @param params.source.sheetName - The name of the sheet to extract data from in each source file.
 * @param params.source.startRow - The 1-based row index to start extraction from. Defaults to 1.
 * @param params.source.startColumn - The 1-based column index to start extraction from. Defaults to 1.
 * @param params.source.maxRows - The maximum number of rows to extract from each source sheet. Defaults to 500.
 * @param params.source.maxColumns - The maximum number of columns to extract from each source sheet. Defaults to 50.
 * @param params.source.requiredColumns - An array of 1-based column indexes (relative to the extracted data) that must not be empty for a row to be considered valid.
 * @param params.destination - Parameters defining where to write the consolidated data in the active sheet.
 * @param params.destination.startRow - The 1-based row index in the destination sheet to start writing data. Defaults to 1.
 * @param params.destination.startColumn - The 1-based column index in the destination sheet to start writing data. Defaults to 1.
 * @returns Void. Data is written directly to the active spreadsheet. If no data is consolidated, logs a message and returns without writing.
 * @throws Error if start row/column values are not positive, or if DriveApp/SpreadsheetApp fails (folder not found, write error, etc.).
 */
function consolidateData(params: {
	folderId: string;
	sort?: { key?: "name" | "date"; order?: "asc" | "desc" };
	source: {
		sheetName: string;
		startRow?: number;
		startColumn?: number;
		maxRows?: number;
		maxColumns?: number;
		requiredColumns?: number[];
	};
	destination: {
		startRow?: number;
		startColumn?: number;
	};
}): void {
	const { folderId, sort = {}, source, destination } = params;
	const { key: sortKey = "name", order: sortOrder = "asc" } = sort;
	const {
		sheetName,
		startRow: sourceStartRow = 1,
		startColumn: sourceStartColumn = 1,
		maxRows = 500,
		maxColumns = 50,
		requiredColumns,
	} = source;
	const {
		startRow: destinationStartRow = 1,
		startColumn: destinationStartColumn = 1,
	} = destination;

	if (
		sourceStartRow < 1 ||
		sourceStartColumn < 1 ||
		destinationStartRow < 1 ||
		destinationStartColumn < 1
	) {
		throw new Error("Start row and column values must be positive integers.");
	}

	const destinationSheet =
		SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	const consolidatedData: SheetCell[][] = [];

	const folder = DriveApp.getFolderById(folderId);
	const files: GoogleAppsScript.Drive.File[] = [];
	const fileIterator = folder.getFiles();

	while (fileIterator.hasNext()) {
		files.push(fileIterator.next());
	}

	// Sort files by name or last updated date
	files.sort((a, b) => {
		const value =
			sortKey === "name"
				? a.getName().localeCompare(b.getName())
				: a.getLastUpdated().getTime() - b.getLastUpdated().getTime();
		return sortOrder === "asc" ? value : -value;
	});

	for (const file of files) {
		if (file.getMimeType() !== "application/vnd.google-apps.spreadsheet") {
			continue;
		}

		try {
			const sourceSheet = SpreadsheetApp.open(file).getSheetByName(sheetName);

			if (!sourceSheet) {
				console.log(
					`Skipping file "${file.getName()}" because sheet "${sheetName}" does not exist.`,
				);
				continue;
			}

			const numRows = Math.min(
				maxRows,
				sourceSheet.getLastRow() - sourceStartRow + 1,
			);
			const numColumns = Math.min(
				maxColumns,
				sourceSheet.getLastColumn() - sourceStartColumn + 1,
			);

			if (numRows <= 0 || numColumns <= 0) {
				console.log(
					`Skipping file "${file.getName()}" due to insufficient data at specified start row/column.`,
				);
				continue;
			}

			const data: SheetCell[][] = sourceSheet
				.getRange(sourceStartRow, sourceStartColumn, numRows, numColumns)
				.getValues();

			for (const row of data) {
				const isValid = requiredColumns
					? requiredColumns.every(
							(colIndex) =>
								colIndex >= 1 &&
								colIndex <= row.length &&
								row[colIndex - 1] !== "" &&
								row[colIndex - 1] != null,
						)
					: true;

				if (!isValid) continue;

				consolidatedData.push([file.getName(), ...row]);
			}
		} catch (error) {
			// Keep processing the remaining files even if one fails to open
			console.log(`Skipping file "${file.getName()}": ${String(error)}`);
		}
	}

	if (consolidatedData.length === 0) {
		console.log(
			"No data was consolidated. Please check if the source sheets contain valid data.",
		);
		return;
	}

	destinationSheet
		.getRange(
			destinationStartRow,
			destinationStartColumn,
			consolidatedData.length,
			consolidatedData[0].length,
		)
		.setValues(consolidatedData);
}

export { consolidateData };
