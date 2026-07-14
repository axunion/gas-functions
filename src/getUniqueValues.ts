type SheetCell = number | string | boolean | Date | null | undefined;

/**
 * Retrieves unique, non-null, and non-undefined values from a specified column in a 2D array.
 *
 * @param params - The parameters for retrieving unique values.
 * @param params.rows - The 2D array of sheet cells. If empty, an empty array is returned.
 * @param params.columnIndex - The 0-based index of the column from which to retrieve unique values.
 * @returns An array of unique, non-null, and non-undefined values from the specified column.
 * @throws Error if `rows` is not empty and `columnIndex` is out of bounds for the first row.
 */
function getUniqueValues(params: {
	rows: SheetCell[][];
	columnIndex: number;
}): SheetCell[] {
	const { rows, columnIndex } = params;

	if (rows.length === 0) {
		return [];
	}

	const rowLength = rows[0].length;

	if (columnIndex < 0 || columnIndex >= rowLength) {
		throw new Error(
			`columnIndex ${columnIndex} is out of bounds for row length ${rowLength}.`,
		);
	}

	const uniqueValues = new Set<SheetCell>();

	for (const row of rows) {
		const cell = row[columnIndex];
		if (cell !== null && cell !== undefined) {
			uniqueValues.add(cell);
		}
	}

	return Array.from(uniqueValues);
}

export { getUniqueValues };
