function getIndexes(row: string[], names: string[]): number[] {
  return names.map((name) => {
    const index = row.indexOf(name);

    if (index === -1) {
      console.error(`Name "${name}" not found`);
    }

    return index;
  });
}

export { getIndexes };
