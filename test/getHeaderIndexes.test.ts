import { describe, it, expect } from "vitest";
import { getHeaderIndexes } from "../src/getHeaderIndexes";

describe("getHeaderIndexes", () => {
  it("should return indexes for specified header names", () => {
    const headers: string[] = ["ID", "Name", "Age", "Gender"];
    const result = getHeaderIndexes({ headers, headerNames: ["Name", "Age"] });
    expect(result).toEqual([1, 2]);
  });

  it("should return -1 for header names that are not found", () => {
    const headers: string[] = ["ID", "Name", "Age", "Gender"];
    const result = getHeaderIndexes({
      headers,
      headerNames: ["Name", "Address"],
    });
    expect(result).toEqual([1, -1]);
  });

  it("should return empty array if headerNames is empty", () => {
    const headers: string[] = ["ID", "Name", "Age", "Gender"];
    const result = getHeaderIndexes({ headers, headerNames: [] });
    expect(result).toEqual([]);
  });

  it("should return -1 for all headers if headers array is empty", () => {
    const headers: string[] = [];
    const result = getHeaderIndexes({ headers, headerNames: ["Name", "Age"] });
    expect(result).toEqual([-1, -1]);
  });

  it("should handle case where some headers are not found", () => {
    const headers: string[] = ["ID", "Name", "Age", "Gender"];
    const result = getHeaderIndexes({
      headers,
      headerNames: ["Name", "Unknown"],
    });
    expect(result).toEqual([1, -1]);
  });
});
