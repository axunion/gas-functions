type SheetCell = number | string | boolean | Date | null | undefined;

type FilterParams = {
  rows: SheetCell[][];
  columnIndex: number;
  filterValue: SheetCell;
  retrieveIndexes: number[];
};

function filter(params: FilterParams): SheetCell[][] {
  const { rows, columnIndex, filterValue, retrieveIndexes } = params;

  if (rows.length === 0) {
    return [];
  }

  if (columnIndex < 0 || columnIndex >= rows[0].length) {
    console.error(`Invalid column index: ${columnIndex}`);
    return [];
  }

  for (const index of retrieveIndexes) {
    if (index < 0 || index >= rows[0].length) {
      console.error(`Invalid retrieve index: ${index}`);
      return [];
    }
  }

  return rows
    .filter((row) => row[columnIndex] === filterValue)
    .map((row) => retrieveIndexes.map((index) => row[index]));
}

export { SheetCell, FilterParams, filter };
