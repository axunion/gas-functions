type SheetCell = number | string | boolean | Date | null | undefined;

/**
 * Represents the structure of grouped data, where keys are stringified group values
 * and values are 2D arrays of retrieved cells for that group.
 */
type GroupedValues = {
	[key: string]: SheetCell[][];
};

/**
 * Groups rows from a 2D array based on the value in a specified column and retrieves cells from specified indexes.
 * Rows with a null or undefined group key are ignored.
 *
 * @param params - The parameters for grouping and data retrieval.
 * @param params.rows - The 2D array of sheet cells to group. If null, undefined, or empty, an empty object is returned.
 * @param params.columnIndex - The 0-based index of the column to group by.
 * @param params.retrieveIndexes - An array of 0-based column indexes to retrieve from each row. If null, undefined, or empty, an empty object is returned.
 * @returns An object where keys are group values (as strings) and values are 2D arrays of the retrieved cells for that group.
 *          Returns an empty object if `rows` or `retrieveIndexes` is null, undefined, or empty.
 * @throws Error if `rows` is not empty and `columnIndex` or any `retrieveIndex` is out of bounds for the first row's length.
 */
function groupBy(params: {
	rows: SheetCell[][] | null | undefined;
	columnIndex: number;
	retrieveIndexes: number[] | null | undefined;
}): GroupedValues {
	const { rows, columnIndex, retrieveIndexes } = params;

	if (
		!rows ||
		rows.length === 0 ||
		!retrieveIndexes ||
		retrieveIndexes.length === 0
	) {
		return {};
	}

	// Validate indexes against the length of the first row.
	// Assumes subsequent rows will have at least these columns if they are to be processed meaningfully.
	const firstRow = rows[0];

	if (!firstRow) {
		// Should not happen if rows.length > 0, but as a safeguard.
		return {};
	}

	const rowLength = firstRow.length;

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

	const groupedValues: GroupedValues = {};

	for (const row of rows) {
		// Ensure the row is an array before trying to access its elements.
		if (!Array.isArray(row)) {
			continue; // Skip malformed rows.
		}

		// It's possible for a row to be shorter than the first row, or for columnIndex to be out of bounds for this specific row.
		// Accessing row[columnIndex] will yield `undefined` in such cases, which is handled by the null/undefined check below.
		const groupKey = row[columnIndex];

		if (groupKey !== null && groupKey !== undefined) {
			const key = String(groupKey); // Convert groupKey to string for object key
			const values = retrieveIndexes.map((index) => row[index]); // This will map to `undefined` if index is out of bounds for the current `row`

			if (!Object.hasOwn(groupedValues, key)) {
				groupedValues[key] = [];
			}
			groupedValues[key].push(values);
		}
	}

	return groupedValues;
}

export { groupBy };
