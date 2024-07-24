type SheetCell = number | string | boolean | Date | null | undefined;

type FilterParams = {
  rows: SheetCell[][];
  filterName: string;
  filterValue: SheetCell;
  retrieveNames: string[];
};

function filter(params: FilterParams): SheetCell[][] {
  const { rows, filterName, filterValue, retrieveNames } = params;

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  const filterIndex = headers.indexOf(filterName);
  const retrieveIndexes = retrieveNames.map((header) =>
    headers.indexOf(header)
  );

  if (filterIndex === -1) {
    console.error(`"${filterName}" not found`);
    return [];
  }

  if (retrieveIndexes.includes(-1)) {
    console.error(`"${retrieveNames}" not found`);
    return [];
  }

  return rows
    .slice(1)
    .filter((row) => row[filterIndex] === filterValue)
    .map((row) => retrieveIndexes.map((index) => row[index]));
}

export { SheetCell, FilterParams, filter };
