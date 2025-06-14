/**
 * Gets the 0-based indexes of specified names within a header row.
 * If `row` or `names` is null/undefined or empty, an empty array is returned.
 *
 * @param params - The parameters for getting indexes.
 * @param params.row - The header row array of strings. Expected to be an array of unique strings for predictable results, though not strictly enforced.
 * @param params.names - An array of names (strings) to find indexes for.
 * @returns An array of 0-based indexes corresponding to the input `names`. Returns -1 for names not found in `row`.
 *          Returns an empty array if `row` or `names` is null, undefined, or empty.
 */
function getIndexes(params: {
	row: string[] | null | undefined;
	names: string[] | null | undefined;
}): number[] {
	const { row, names } = params;

	if (!row || row.length === 0 || !names || names.length === 0) {
		return [];
	}

	const rowMap = new Map<string, number>();

	for (const [index, name] of row.entries()) {
		if (typeof name === "string") {
			// Ensure name is a string before setting it in Map
			rowMap.set(name, index);
		}
	}

	return names.map((name) => {
		if (typeof name === "string") {
			const index = rowMap.get(name);
			return index === undefined ? -1 : index;
		}
		return -1; // If a name in `names` array is not a string, treat as not found.
	});
}

export { getIndexes };
