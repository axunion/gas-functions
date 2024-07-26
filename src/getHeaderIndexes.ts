type GetHeaderIndexesParams = {
  headers: string[];
  headerNames: string[];
};

function getHeaderIndexes(params: GetHeaderIndexesParams): number[] {
  return params.headerNames.map((headerName) => {
    const index = params.headers.indexOf(headerName);

    if (index === -1) {
      console.error(`Header name "${headerName}" not found`);
    }

    return index;
  });
}

export { getHeaderIndexes };
