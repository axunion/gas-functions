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
 * @param params.rows - The 2D array of sheet cells to group. If empty, an empty object is returned.
 * @param params.columnIndex - The 0-based index of the column to group by.
 * @param params.retrieveIndexes - An array of 0-based column indexes to retrieve from each row. If empty, an empty object is returned.
 * @returns An object where keys are group values (as strings) and values are 2D arrays of the retrieved cells for that group.
 * @throws Error if `rows` is not empty and `columnIndex` or any `retrieveIndex` is out of bounds for the first row's length.
 */
function groupBy(params: {
	rows: SheetCell[][];
	columnIndex: number;
	retrieveIndexes: number[];
}): GroupedValues {
	const { rows, columnIndex, retrieveIndexes } = params;

	if (rows.length === 0 || retrieveIndexes.length === 0) {
		return {};
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

	// A null-prototype object avoids collisions with Object.prototype keys (e.g. "__proto__")
	const groupedValues: GroupedValues = Object.create(null);

	for (const row of rows) {
		const groupKey = row[columnIndex];

		if (groupKey === null || groupKey === undefined) {
			continue;
		}

		const key = String(groupKey);
		if (!groupedValues[key]) {
			groupedValues[key] = [];
		}
		groupedValues[key].push(retrieveIndexes.map((index) => row[index]));
	}

	return { ...groupedValues };
}

export { groupBy };
