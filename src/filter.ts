type SheetCell = string | number | boolean | Date | null;
type FilterParams = {
  rows: SheetCell[][];
  filterHeader: string;
  filterValue: SheetCell;
  retrieveHeaders: string[];
};

function filter(params: FilterParams): SheetCell[][] {
  const { rows, filterHeader, filterValue, retrieveHeaders } = params;

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0] as string[];
  const filterIndex = headers.indexOf(filterHeader);
  const retrieveIndexes = retrieveHeaders.map((header) =>
    headers.indexOf(header)
  );

  if (filterIndex === -1 || retrieveIndexes.includes(-1)) {
    return [];
  }

  return rows
    .slice(1)
    .filter((row) => row[filterIndex] === filterValue)
    .map((row) => retrieveIndexes.map((index) => row[index]));
}

export { SheetCell, FilterParams, filter };
