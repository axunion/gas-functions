import { describe, it, expect } from "vitest";
import { filter } from "../src/filter";

describe("filter", () => {
	it("should filter rows and retrieve specified columns", () => {
		const rows = [
			[1, "a", true],
			[2, "b", false],
			[3, "a", true],
			[4, "c", true],
		];
		const result = filter({
			rows,
			columnIndex: 1,
			filterValue: "a",
			retrieveIndexes: [0, 2],
		});
		expect(result).toEqual([
			[1, true],
			[3, true],
		]);
	});

	it("should throw error if rows are empty", () => {
		const rows = [];
		expect(() =>
			filter({
				rows,
				columnIndex: 1,
				filterValue: "a",
				retrieveIndexes: [0, 2],
			}),
		).toThrow("No rows provided.");
	});

	it("should throw error if columnIndex is out of range", () => {
		const rows = [
			[1, "a", true],
			[2, "b", false],
		];
		expect(() =>
			filter({
				rows,
				columnIndex: 5,
				filterValue: "a",
				retrieveIndexes: [0, 2],
			}),
		).toThrow("Invalid column index: 5");
	});

	it("should throw error if any retrieveIndex is out of range", () => {
		const rows = [
			[1, "a", true],
			[2, "b", false],
		];
		expect(() =>
			filter({
				rows,
				columnIndex: 1,
				filterValue: "a",
				retrieveIndexes: [0, 5],
			}),
		).toThrow("Invalid retrieve index: 5");
	});

	it("should handle null and undefined values correctly", () => {
		const rows = [
			[1, "a", null],
			[2, undefined, false],
			[3, "a", true],
		];
		const result = filter({
			rows,
			columnIndex: 1,
			filterValue: "a",
			retrieveIndexes: [0, 2],
		});
		expect(result).toEqual([
			[1, null],
			[3, true],
		]);
	});
});
