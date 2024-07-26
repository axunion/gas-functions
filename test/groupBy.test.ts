import { describe, it, expect } from "vitest";
import { groupBy } from "../src/groupBy";

describe("groupBy", () => {
  it("should group rows by specified column and retrieve specified columns", () => {
    const rows = [
      [1, "A", 10],
      [2, "B", 20],
      [3, "A", 30],
      [4, "B", 40],
      [5, "C", 50],
    ];
    const result = groupBy({
      rows,
      columnIndex: 1,
      retrieveIndexes: [0, 2],
    });
    expect(result).toEqual({
      A: [
        [1, 10],
        [3, 30],
      ],
      B: [
        [2, 20],
        [4, 40],
      ],
      C: [[5, 50]],
    });
  });

  it("should return an empty object if rows are empty", () => {
    const rows = [];
    const result = groupBy({
      rows,
      columnIndex: 1,
      retrieveIndexes: [0, 2],
    });
    expect(result).toEqual({});
  });

  it("should return an empty object if columnIndex is out of range", () => {
    const rows = [
      [1, "A", 10],
      [2, "B", 20],
    ];
    const result = groupBy({
      rows,
      columnIndex: 5,
      retrieveIndexes: [0, 2],
    });
    expect(result).toEqual({});
  });

  it("should return an empty object if any retrieveIndex is out of range", () => {
    const rows = [
      [1, "A", 10],
      [2, "B", 20],
    ];
    const result = groupBy({
      rows,
      columnIndex: 1,
      retrieveIndexes: [0, 5],
    });
    expect(result).toEqual({});
  });

  it("should handle null and undefined values correctly", () => {
    const rows = [
      [1, "A", null],
      [2, undefined, 20],
      [3, "A", 30],
    ];
    const result = groupBy({
      rows,
      columnIndex: 1,
      retrieveIndexes: [0, 2],
    });
    expect(result).toEqual({
      A: [
        [1, null],
        [3, 30],
      ],
    });
  });
});
