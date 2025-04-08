type SheetCell = number | string | boolean | Date | null | undefined;

/**
 * Consolidates data from all Google Sheets files within a specified folder.
 *
 * Each file's specified sheet is accessed, and a range of data is extracted starting
 * from a given row/column. Valid rows are appended to the active sheet.
 *
 * Output format:
 * - Column A: Source file name.
 * - Columns B onward: Extracted row data.
 *
 * @param {object} params - Consolidation settings.
 * @param {string} params.folderId - The ID of the Drive folder containing spreadsheets.
 * @param {object} [params.sort] - Sorting options for files.
 * @param {"name"|"date"} [params.sort.key="name"] - Sort files by name or last updated date.
 * @param {"asc"|"desc"} [params.sort.order="asc"] - Sort order.
 * @param {object} params.source - Source sheet and range info.
 * @param {string} params.source.sheetName - Sheet name to extract data from.
 * @param {number} [params.source.startRow=1] - Row to start extraction (1-indexed).
 * @param {number} [params.source.startColumn=1] - Column to start extraction (1-indexed).
 * @param {number} [params.source.maxRows] - Max number of rows to extract.
 * @param {number} [params.source.maxColumns] - Max number of columns to extract.
 * @param {number[]} [params.source.requiredColumns] - Required (non-empty) columns (1-indexed, relative to extracted data).
 * @param {object} params.destination - Where to write consolidated data.
 * @param {number} [params.destination.startRow=1] - Destination start row (1-indexed).
 * @param {number} [params.destination.startColumn=1] - Destination start column (1-indexed).
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
		throw new Error(
			"Error: Start row and column values must be positive integers.",
		);
	}

	const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	const destinationSheet = activeSpreadsheet.getActiveSheet();
	const consolidatedData: SheetCell[][] = [];

	// Retrieve target folder
	let folder: GoogleAppsScript.Drive.Folder;

	try {
		folder = DriveApp.getFolderById(folderId);
	} catch (e) {
		throw new Error(`Error retrieving folder with ID "${folderId}": ${e}`);
	}

	const files: GoogleAppsScript.Drive.File[] = [];
	const fileIterator = folder.getFiles();

	while (fileIterator.hasNext()) {
		files.push(fileIterator.next());
	}

	// Sort files by name or last updated date
	files.sort((a, b) => {
		let value = 0;
		if (sortKey === "name") {
			value = a.getName().localeCompare(b.getName());
		} else if (sortKey === "date") {
			value = a.getLastUpdated().getTime() - b.getLastUpdated().getTime();
		}
		return sortOrder === "asc" ? value : -value;
	});

	for (const file of files) {
		if (file.getMimeType() !== "application/vnd.google-apps.spreadsheet") {
			continue;
		}

		try {
			const ss = SpreadsheetApp.open(file);
			const sourceSheet = ss.getSheetByName(sheetName);

			if (!sourceSheet) {
				Logger.log(
					`Skipping file "${file.getName()}" because sheet "${sheetName}" does not exist.`,
				);
				continue;
			}

			const sourceLastRow = sourceSheet.getLastRow();
			const sourceLastColumn = sourceSheet.getLastColumn();
			const numRows = Math.min(maxRows, sourceLastRow - sourceStartRow + 1);
			const numColumns = Math.min(
				maxColumns,
				sourceLastColumn - sourceStartColumn + 1,
			);

			if (numRows <= 0 || numColumns <= 0) {
				Logger.log(
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
			Logger.log(`Skipping file "${file.getName()}": ${error}`);
		}
	}

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
			"No data was consolidated. Please check if the source sheets contain valid data.",
		);
	}
}
