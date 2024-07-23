import { describe, it, expect } from "vitest";
import { getUniqueValues, SheetCell } from "../src/getUniqueValues";

describe("getUniqueValues", () => {
  it("should return unique values for the given header", () => {
    const rows: SheetCell[][] = [
      ["header1", "header2", "header3"],
      [1, "a", true],
      [2, "b", false],
      [3, "a", true],
      [4, "c", null],
    ];
    const headerName = "header2";
    const result = getUniqueValues({ rows, headerName });
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("should return an empty array if rows are empty", () => {
    const rows: SheetCell[][] = [];
    const headerName = "header2";
    const result = getUniqueValues({ rows, headerName });
    expect(result).toEqual([]);
  });

  it("should return an empty array if header is not found", () => {
    const rows: SheetCell[][] = [
      ["header1", "header2", "header3"],
      [1, "a", true],
      [2, "b", false],
    ];
    const headerName = "nonexistent";
    const result = getUniqueValues({ rows, headerName });
    expect(result).toEqual([]);
  });

  it("should handle null and undefined values correctly", () => {
    const rows: SheetCell[][] = [
      ["header1", "header2", "header3"],
      [1, "a", true],
      [2, null, false],
      [3, undefined, true],
      [4, "a", null],
    ];
    const headerName = "header2";
    const result = getUniqueValues({ rows, headerName });
    expect(result).toEqual(["a"]);
  });

  it("should return unique string representations for different data types", () => {
    const rows: SheetCell[][] = [
      ["header1", "header2", "header3"],
      [1, 1, true],
      [2, "1", false],
      [3, true, true],
      [4, "true", null],
    ];
    const headerName = "header2";
    const result = getUniqueValues({ rows, headerName });
    expect(result).toEqual(["1", "true"]);
  });
});
