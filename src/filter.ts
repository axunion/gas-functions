type SheetCell = number | string | boolean | Date | null | undefined;

/**
 * Filters rows based on a value in a specified column and retrieves cells from specified indexes.
 *
 * @param params - The parameters for filtering and data retrieval.
 * @param params.rows - The 2D array of sheet cells to filter. If empty, an empty array is returned.
 * @param params.columnIndex - The 0-based index of the column to filter by.
 * @param params.filterValue - The value to match in the filter column.
 * @param params.retrieveIndexes - An array of 0-based column indexes to retrieve from the filtered rows. If empty, matched rows are returned as empty arrays.
 * @returns A 2D array of sheet cells containing the filtered and retrieved data. Returns an empty array if input `rows` is empty.
 * @throws Error if `columnIndex` or any `retrieveIndex` is out of bounds for the provided `rows` (when `rows` is not empty).
 */
function filter(params: {
	rows: SheetCell[][];
	columnIndex: number;
	filterValue: SheetCell;
	retrieveIndexes: number[];
}): SheetCell[][] {
	const { rows, columnIndex, filterValue, retrieveIndexes } = params;

	if (rows.length === 0) {
		return [];
	}

	const rowLength = rows[0].length;

	if (columnIndex < 0 || columnIndex >= rowLength) {
		throw new Error(
			`columnIndex ${columnIndex} is out of bounds for row length ${rowLength}.`,
		);
	}

	for (const index of retrieveIndexes) {
		if (index < 0 || index >= rowLength) {
			throw new Error(
				`retrieveIndex ${index} is out of bounds for row length ${rowLength}.`,
			);
		}
	}

	return rows
		.filter((row) => row[columnIndex] === filterValue)
		.map((row) => retrieveIndexes.map((index) => row[index]));
}

export { filter };
