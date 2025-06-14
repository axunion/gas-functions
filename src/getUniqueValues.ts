type SheetCell = number | string | boolean | Date | null | undefined;

/**
 * Retrieves unique, non-null, and non-undefined values from a specified column in a 2D array.
 *
 * @param params - The parameters for retrieving unique values.
 * @param params.rows - The 2D array of sheet cells. If null, undefined, or empty, an empty array is returned.
 * @param params.columnIndex - The 0-based index of the column from which to retrieve unique values.
 * @returns An array of unique, non-null, and non-undefined values from the specified column. Returns an empty array if `rows` is null, undefined, or empty.
 * @throws Error if `rows` is not empty and `columnIndex` is out of bounds for the provided `rows`.
 */
function getUniqueValues(params: {
	rows: SheetCell[][] | null | undefined;
	columnIndex: number;
}): SheetCell[] {
	const { rows, columnIndex } = params;

	if (!rows || rows.length === 0) {
		return [];
	}

	// Validate columnIndex only if rows are present and not empty.
	// Assuming all inner arrays (rows) have the same length as the first row.
	// A more robust solution might iterate to find max length or validate each row.
	if (
		rows[0] === undefined ||
		columnIndex < 0 ||
		columnIndex >= rows[0].length
	) {
		throw new Error(
			`columnIndex ${columnIndex} is out of bounds or rows are malformed.`,
		);
	}

	const uniqueValues = new Set<SheetCell>();

	for (const row of rows) {
		// Ensure the row itself is an array and columnIndex is valid for this specific row.
		if (Array.isArray(row) && columnIndex < row.length) {
			const cell = row[columnIndex];
			if (cell !== null && cell !== undefined) {
				uniqueValues.add(cell);
			}
		}
	}

	return Array.from(uniqueValues);
}

export { getUniqueValues };
