/**
 * Gets the 0-based indexes of specified names within a header row.
 *
 * @param params - The parameters for getting indexes.
 * @param params.row - The header row array of strings. Expected to contain unique values for predictable results.
 * @param params.names - An array of names (strings) to find indexes for.
 * @returns An array of 0-based indexes corresponding to the input `names`. Returns -1 for names not found in `row`.
 *          Returns an empty array if `row` or `names` is empty.
 */
function getIndexes(params: { row: string[]; names: string[] }): number[] {
	const { row, names } = params;

	if (row.length === 0 || names.length === 0) {
		return [];
	}

	const rowMap = new Map(row.map((name, index) => [name, index]));

	return names.map((name) => rowMap.get(name) ?? -1);
}

export { getIndexes };
