/**
 * Returns the indexes of specified names from a spreadsheet row.
 * Logs an error if a name is not found.
 */
function spreadSheetGetIndexes(row: string[], names: string[]): number[] {
	return names.map((name) => {
		const index = row.indexOf(name);

		if (index === -1) {
			console.error(`Name "${name}" not found`);
		}

		return index;
	});
}

export { spreadSheetGetIndexes };
