import { describe, expect, it } from "vitest";
import { groupBy } from "../src/groupBy";

describe("groupBy", () => {
	it("groups rows by specified column and retrieves specified columns", () => {
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

	it("returns an empty object if rows are empty", () => {
		const result = groupBy({
			rows: [],
			columnIndex: 1,
			retrieveIndexes: [0, 2],
		});
		expect(result).toEqual({});
	});

	it("returns an empty object if retrieveIndexes is empty", () => {
		const rows = [
			[1, "A", 10],
			[2, "B", 20],
		];
		const result = groupBy({ rows, columnIndex: 1, retrieveIndexes: [] });
		expect(result).toEqual({});
	});

	it("throws if columnIndex is out of range", () => {
		const rows = [
			[1, "A", 10],
			[2, "B", 20],
		];
		expect(() =>
			groupBy({
				rows,
				columnIndex: 5,
				retrieveIndexes: [0, 2],
			}),
		).toThrow("columnIndex 5 is out of bounds for row length 3.");
	});

	it("throws if any retrieveIndex is out of range", () => {
		const rows = [
			[1, "A", 10],
			[2, "B", 20],
		];
		expect(() =>
			groupBy({
				rows,
				columnIndex: 1,
				retrieveIndexes: [0, 5],
			}),
		).toThrow("retrieveIndex 5 is out of bounds for row length 3.");
	});

	it("ignores rows whose group key is null or undefined", () => {
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

	it("handles group keys that collide with Object.prototype properties", () => {
		const rows = [
			["__proto__", 1],
			["constructor", 2],
		];
		const result = groupBy({ rows, columnIndex: 0, retrieveIndexes: [1] });
		expect(result.__proto__).toEqual([[1]]);
		expect(result.constructor).toEqual([[2]]);
	});
});
