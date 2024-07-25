type SheetCell = number | string | boolean | Date | null | undefined;

type GetUniqueValuesParams = {
  rows: SheetCell[][];
  columnIndex: number;
};

function getUniqueValues(params: GetUniqueValuesParams): SheetCell[] {
  const { rows, columnIndex } = params;

  if (rows.length === 0) {
    return [];
  }

  if (columnIndex < 0 || columnIndex >= rows[0].length) {
    console.error(`Invalid column index: ${columnIndex}`);
    return [];
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

export { SheetCell, getUniqueValues };
