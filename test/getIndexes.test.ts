import { describe, it, expect } from "vitest";
import { getIndexes } from "../src/getIndexes";

describe("getIndexes", () => {
  it("should return indexes for specified names", () => {
    const row: string[] = ["ID", "Name", "Age", "Gender"];
    const result = getIndexes(row, ["Name", "Age"]);
    expect(result).toEqual([1, 2]);
  });

  it("should return -1 for names that are not found", () => {
    const row: string[] = ["ID", "Name", "Age", "Gender"];
    const result = getIndexes(row, ["Name", "Address"]);
    expect(result).toEqual([1, -1]);
  });

  it("should return empty array if names is empty", () => {
    const row: string[] = ["ID", "Name", "Age", "Gender"];
    const result = getIndexes(row, []);
    expect(result).toEqual([]);
  });

  it("should return -1 for all row if row array is empty", () => {
    const row: string[] = [];
    const result = getIndexes(row, ["Name", "Age"]);
    expect(result).toEqual([-1, -1]);
  });

  it("should handle case where some row are not found", () => {
    const row: string[] = ["ID", "Name", "Age", "Gender"];
    const result = getIndexes(row, ["Name", "Unknown"]);
    expect(result).toEqual([1, -1]);
  });
});
