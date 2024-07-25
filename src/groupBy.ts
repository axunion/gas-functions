type SheetCell = number | string | boolean | Date | null | undefined;

type GroupByParams = {
  rows: SheetCell[][];
  columnIndex: number;
  retrieveIndexes: number[];
};

type GroupedValues = {
  [key: string]: SheetCell[][];
};

function groupBy(params: GroupByParams): GroupedValues {
  const { rows, columnIndex, retrieveIndexes } = params;

  if (rows.length === 0) {
    return {};
  }

  if (columnIndex < 0 || columnIndex >= rows[0].length) {
    console.error(`Invalid column index: ${columnIndex}`);
    return {};
  }

  for (const index of retrieveIndexes) {
    if (index < 0 || index >= rows[0].length) {
      console.error(`Invalid retrieve index: ${index}`);
      return {};
    }
  }

  const groupedValues: GroupedValues = {};

  for (const row of rows) {
    const groupKey = row[columnIndex];
    const values = retrieveIndexes.map((index) => row[index]);

    if (groupKey !== null && groupKey !== undefined) {
      const key = groupKey.toString();

      if (!groupedValues[key]) {
        groupedValues[key] = [];
      }

      groupedValues[key].push(values);
    }
  }

  return groupedValues;
}

export { SheetCell, GroupByParams, GroupedValues, groupBy };
