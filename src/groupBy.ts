type SheetCell = number | string | boolean | Date | null | undefined;

type GroupByParams = {
  rows: SheetCell[][];
  groupByName: string;
  retrieveNames: string[];
};

type GroupedValues = {
  [key: string]: SheetCell[][];
};

function groupBy(params: GroupByParams): GroupedValues {
  const { rows, groupByName, retrieveNames } = params;

  if (rows.length === 0) {
    return {};
  }

  const headers = rows[0];
  const groupByIndex = headers.indexOf(groupByName);
  const retrieveIndexes = retrieveNames.map((header) =>
    headers.indexOf(header)
  );

  if (groupByIndex === -1) {
    console.error(`"${groupByName}" not found`);
    return {};
  }

  if (retrieveIndexes.includes(-1)) {
    console.error(`"${retrieveNames}" not found`);
    return {};
  }

  const groupedValues: GroupedValues = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const groupKey = row[groupByIndex];
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
