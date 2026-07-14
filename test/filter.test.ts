import { describe, expect, it } from "vitest";
import { filter } from "../src/filter";

describe("filter", () => {
	it("filters rows and retrieves specified columns", () => {
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

	it("returns empty array if rows are empty", () => {
		const result = filter({
			rows: [],
			columnIndex: 1,
			filterValue: "a",
			retrieveIndexes: [0, 2],
		});
		expect(result).toEqual([]);
	});

	it("returns empty rows when retrieveIndexes is empty", () => {
		const rows = [
			[1, "a", true],
			[2, "b", false],
			[3, "a", true],
		];
		const result = filter({
			rows,
			columnIndex: 1,
			filterValue: "a",
			retrieveIndexes: [],
		});
		expect(result).toEqual([[], []]);
	});

	it("throws if columnIndex is out of range", () => {
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

	it("throws if any retrieveIndex is out of range", () => {
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

	it("handles null and undefined values correctly", () => {
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
