/**
 * Returns the indexes of specified names.
 */
function getIndexes(params: {
	row: string[];
	names: string[];
}): number[] {
	const { row, names } = params;
	const rowMap = new Map<string, number>();

	for (const [index, name] of row.entries()) {
		rowMap.set(name, index);
	}

	return names.map((name) => {
		const index = rowMap.get(name);

		if (index === undefined) {
			return -1;
		}

		return index;
	});
}

export { getIndexes };
