type SheetCell = number | string | boolean | Date | null | undefined;

type GroupedValues = {
	[key: string]: SheetCell[][];
};

/**
 * Groups spreadsheet rows by a specified column value and retrieves cells at given indexes.
 * Rows with null or undefined group key are ignored.
 */
function groupBy(params: {
	rows: SheetCell[][];
	columnIndex: number;
	retrieveIndexes: number[];
}): GroupedValues {
	const { rows, columnIndex, retrieveIndexes } = params;

	if (rows.length === 0) {
		return {};
	}

	const rowLength = rows[0].length;

	if (columnIndex < 0 || columnIndex >= rowLength) {
		throw new Error(`Invalid column index: ${columnIndex}`);
	}

	for (const index of retrieveIndexes) {
		if (index < 0 || index >= rowLength) {
			throw new Error(`Invalid retrieve index: ${index}`);
		}
	}

	const groupedValues: GroupedValues = {};

	for (const row of rows) {
		// Optionally, you might check if row.length === rowLength for consistency.
		const groupKey = row[columnIndex];
		const values = retrieveIndexes.map((index) => row[index]);

		if (groupKey !== null && groupKey !== undefined) {
			const key = groupKey.toString();

			if (!groupedValues[key]) {
				groupedValues[key] = [];
			}

			groupedValues[key].push(values);
		}
	}

	return groupedValues;
}

export { groupBy };
