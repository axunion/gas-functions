type SheetCell = number | string | boolean | Date | null | undefined;
type GetUniqueValuesParams = {
  rows: SheetCell[][];
  headerName: string;
};

function getUniqueValues(params: GetUniqueValuesParams): string[] {
  const { rows, headerName } = params;

  if (rows.length === 0) {
    return [];
  }

  const headerRow = rows[0];
  const columnIndex = headerRow.indexOf(headerName);

  if (columnIndex === -1) {
    console.error(`Header name ${headerName} not found`);
    return [];
  }

  const uniqueValues = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cell = row[columnIndex];

    if (cell !== null && cell !== undefined) {
      uniqueValues.add(cell.toString());
    }
  }

  return Array.from(uniqueValues);
}

export { SheetCell, getUniqueValues };
