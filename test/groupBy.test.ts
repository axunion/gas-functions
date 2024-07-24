import { describe, it, expect } from "vitest";
import { groupBy, SheetCell, GroupByParams } from "../src/groupBy";

describe("groupBy", () => {
  it("should group values by the given header and retrieve specified values", () => {
    const rows: SheetCell[][] = [
      ["id", "group", "value1", "value2"],
      [1, "A", 10, 100],
      [2, "B", 20, 200],
      [3, "A", 30, 300],
      [4, "B", 40, 400],
      [5, "C", 50, 500],
    ];
    const params: GroupByParams = {
      rows,
      groupByName: "group",
      retrieveNames: ["value1", "value2"],
    };
    const result = groupBy(params);
    expect(result).toEqual({
      A: [
        [10, 100],
        [30, 300],
      ],
      B: [
        [20, 200],
        [40, 400],
      ],
      C: [[50, 500]],
    });
  });

  it("should return an empty object if rows are empty", () => {
    const rows: SheetCell[][] = [];
    const params: GroupByParams = {
      rows,
      groupByName: "group",
      retrieveNames: ["value1"],
    };
    const result = groupBy(params);
    expect(result).toEqual({});
  });

  it("should return an empty object if groupByName is not found", () => {
    const rows: SheetCell[][] = [
      ["id", "group", "value"],
      [1, "A", 10],
      [2, "B", 20],
    ];
    const params: GroupByParams = {
      rows,
      groupByName: "nonexistent",
      retrieveNames: ["value"],
    };
    const result = groupBy(params);
    expect(result).toEqual({});
  });

  it("should return an empty object if any retrieveNames are not found", () => {
    const rows: SheetCell[][] = [
      ["id", "group", "value"],
      [1, "A", 10],
      [2, "B", 20],
    ];
    const params: GroupByParams = {
      rows,
      groupByName: "group",
      retrieveNames: ["nonexistent"],
    };
    const result = groupBy(params);
    expect(result).toEqual({});
  });

  it("should handle null and undefined values correctly", () => {
    const rows: SheetCell[][] = [
      ["id", "group", "value"],
      [1, "A", 10],
      [2, "A", null],
      [3, "A", undefined],
      [4, "B", 20],
    ];
    const params: GroupByParams = {
      rows,
      groupByName: "group",
      retrieveNames: ["value"],
    };
    const result = groupBy(params);
    expect(result).toEqual({
      A: [[10], [null], [undefined]],
      B: [[20]],
    });
  });
});
