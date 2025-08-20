import { describe, expect, it } from "vitest";
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

	it("should return empty array if rows are empty", () => {
		const rows = [];
		const result = filter({
			rows,
			columnIndex: 1,
			filterValue: "a",
			retrieveIndexes: [0, 2],
		});
		expect(result).toEqual([]);
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
		).toThrow("columnIndex 5 is out of bounds for row length 3.");
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
		).toThrow("retrieveIndex 5 is out of bounds for row length 3.");
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
