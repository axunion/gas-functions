import { describe, it, expect } from "vitest";
import { getUniqueValues } from "../src/getUniqueValues";

describe("getUniqueValues", () => {
  it("should return unique values from the specified column", () => {
    const rows = [
      ["Header1", "Header2", "Header3"],
      [1, "a", true],
      [2, "b", false],
      [3, "a", true],
    ];
    const rowsWithoutHeader = rows.slice(1);
    const result = getUniqueValues({ rows: rowsWithoutHeader, columnIndex: 1 });
    expect(result).toEqual(["a", "b"]);
  });

  it("should handle empty rows", () => {
    const rows = [];
    const result = getUniqueValues({ rows, columnIndex: 1 });
    expect(result).toEqual([]);
  });

  it("should handle columnIndex out of range", () => {
    const rows = [
      ["Header1", "Header2", "Header3"],
      [1, "a", true],
      [2, "b", false],
    ];
    const rowsWithoutHeader = rows.slice(1);
    const result = getUniqueValues({
      rows: rowsWithoutHeader,
      columnIndex: 10,
    });
    expect(result).toEqual([]);
  });

  it("should exclude null and undefined values", () => {
    const rows = [
      ["Header1", "Header2", "Header3"],
      [1, "a", null],
      [2, undefined, false],
      [3, "a", true],
    ];
    const rowsWithoutHeader = rows.slice(1);
    const result = getUniqueValues({ rows: rowsWithoutHeader, columnIndex: 1 });
    expect(result).toEqual(["a"]);
  });

  it("should handle boolean values correctly", () => {
    const rows = [
      ["Header1", "Header2", "Header3"],
      [1, true, "x"],
      [2, false, "y"],
      [3, true, "z"],
    ];
    const rowsWithoutHeader = rows.slice(1);
    const result = getUniqueValues({ rows: rowsWithoutHeader, columnIndex: 1 });
    expect(result).toEqual([true, false]);
  });
});
