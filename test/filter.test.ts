import { describe, it, expect } from "vitest";
import { filter, FilterParams } from "../src/filter";

describe("filter function", () => {
  it("should filter and return the correct values based on filterColumnIndex and filterValue", () => {
    const params: FilterParams = {
      rows: [
        ["Alice", "Engineer", 30],
        ["Bob", "Designer", 25],
        ["Charlie", "Engineer", 35],
      ],
      filterColumnIndex: 1,
      filterValue: "Engineer",
      targetColumnIndexes: [0, 2],
    };

    const expected = [
      ["Alice", 30],
      ["Charlie", 35],
    ];

    const result = filter(params);
    expect(result).toEqual(expected);
  });

  it("should return an empty array if no matches are found", () => {
    const params: FilterParams = {
      rows: [
        ["Alice", "Engineer", 30],
        ["Bob", "Designer", 25],
        ["Charlie", "Engineer", 35],
      ],
      filterColumnIndex: 1,
      filterValue: "Manager",
      targetColumnIndexes: [0, 2],
    };

    const expected: unknown[][] = [];

    const result = filter(params);
    expect(result).toEqual(expected);
  });

  it("should handle an empty data array", () => {
    const params: FilterParams = {
      rows: [],
      filterColumnIndex: 1,
      filterValue: "Engineer",
      targetColumnIndexes: [0, 2],
    };

    const expected: unknown[][] = [];

    const result = filter(params);
    expect(result).toEqual(expected);
  });

  it("should handle targetColumnIndexes that are out of bounds", () => {
    const params: FilterParams = {
      rows: [
        ["Alice", "Engineer", 30],
        ["Bob", "Designer", 25],
        ["Charlie", "Engineer", 35],
      ],
      filterColumnIndex: 1,
      filterValue: "Engineer",
      targetColumnIndexes: [0, 3],
    };

    const expected = [
      ["Alice", undefined],
      ["Charlie", undefined],
    ];

    const result = filter(params);
    expect(result).toEqual(expected);
  });

  it("should handle filterColumnIndex that is out of bounds", () => {
    const params: FilterParams = {
      rows: [
        ["Alice", "Engineer", 30],
        ["Bob", "Designer", 25],
        ["Charlie", "Engineer", 35],
      ],
      filterColumnIndex: 3,
      filterValue: "Engineer",
      targetColumnIndexes: [0, 2],
    };

    const expected: unknown[][] = [];

    const result = filter(params);
    expect(result).toEqual(expected);
  });
});
