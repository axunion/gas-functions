type SheetCell = string | number | boolean | Date | null;
type FilterParams = {
  rows: SheetCell[][];
  headerName: string;
  headerValue: SheetCell;
  retrieveHeaders: string[];
};

function filter(params: FilterParams): SheetCell[][] {
  const { rows, headerName, headerValue, retrieveHeaders } = params;

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0] as string[];
  const filterIndex = headers.indexOf(headerName);
  const retrieveIndexes = retrieveHeaders.map((header) =>
    headers.indexOf(header)
  );

  if (filterIndex === -1 || retrieveIndexes.includes(-1)) {
    return [];
  }

  return rows
    .slice(1)
    .filter((row) => row[filterIndex] === headerValue)
    .map((row) => retrieveIndexes.map((index) => row[index]));
}

export { SheetCell, FilterParams, filter };
