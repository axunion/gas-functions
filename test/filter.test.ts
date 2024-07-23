import { describe, it, expect } from "vitest";
import { type SheetCell, type FilterParams, filter } from "../src/filter";

const testData: SheetCell[][] = [
  ["Date", "Name", "Age", "Gender", "MemberType", "Event"],
  ["2024/01/01", "Alice", 30, "Female", "Member", "Attended"],
  ["2024/01/02", "Bob", 25, "Male", "Non-Member", "Not Attended"],
  ["2024/01/03", "Charlie", 35, "Male", "Member", "Attended"],
  ["2024/01/04", "Diana", 28, "Female", "Member", "Not Attended"],
  ["2024/01/05", "Eve", 22, "Female", "Non-Member", "Attended"],
];

describe("filter function tests", () => {
  it("should return rows where MemberType is Member", () => {
    const params: FilterParams = {
      rows: testData,
      headerName: "MemberType",
      headerValue: "Member",
      retrieveHeaders: ["Name", "Event"],
    };

    const result = filter(params);
    expect(result).toEqual([
      ["Alice", "Attended"],
      ["Charlie", "Attended"],
      ["Diana", "Not Attended"],
    ]);
  });

  it("should return empty array when headerValue does not match any rows", () => {
    const params: FilterParams = {
      rows: testData,
      headerName: "Name",
      headerValue: "Zoe",
      retrieveHeaders: ["Name", "Event"],
    };

    const result = filter(params);
    expect(result).toEqual([]);
  });

  it("should return empty array when headerName is not found", () => {
    const params: FilterParams = {
      rows: testData,
      headerName: "NonExistentHeader",
      headerValue: "Member",
      retrieveHeaders: ["Name", "Event"],
    };

    const result = filter(params);
    expect(result).toEqual([]);
  });

  it("should return empty array when retrieveHeader is not found", () => {
    const params: FilterParams = {
      rows: testData,
      headerName: "MemberType",
      headerValue: "Member",
      retrieveHeaders: ["NonExistentHeader"],
    };

    const result = filter(params);
    expect(result).toEqual([]);
  });
});
