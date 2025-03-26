type SheetCell = number | string | boolean | Date | null | undefined;

/**
 * Filters rows by matching a value in a specified column,
 * then returns only the cells at the specified indexes.
 */
function filter(params: {
	rows: SheetCell[][];
	columnIndex: number;
	filterValue: SheetCell;
	retrieveIndexes: number[];
}): SheetCell[][] {
	const { rows, columnIndex, filterValue, retrieveIndexes } = params;

	if (rows.length === 0) {
		throw new Error("No rows provided.");
	}

	// Assume all rows have the same number of columns as the first row.
	const rowLength = rows[0].length;

	if (columnIndex < 0 || columnIndex >= rowLength) {
		throw new Error(`Invalid column index: ${columnIndex}`);
	}

	for (const index of retrieveIndexes) {
		if (index < 0 || index >= rowLength) {
			throw new Error(`Invalid retrieve index: ${index}`);
		}
	}

	return rows
		.filter((row) => row[columnIndex] === filterValue)
		.map((row) => retrieveIndexes.map((index) => row[index]));
}

export { filter };
