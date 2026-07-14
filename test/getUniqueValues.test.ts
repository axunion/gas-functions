import { describe, expect, it } from "vitest";
import { getUniqueValues } from "../src/getUniqueValues";

describe("getUniqueValues", () => {
	it("returns unique values from the specified column", () => {
		const rows = [
			[1, "a", true],
			[2, "b", false],
			[3, "a", true],
		];
		expect(getUniqueValues({ rows, columnIndex: 1 })).toEqual(["a", "b"]);
	});

	it("returns empty array if rows are empty", () => {
		expect(getUniqueValues({ rows: [], columnIndex: 1 })).toEqual([]);
	});

	it("throws if columnIndex is out of range", () => {
		const rows = [
			[1, "a", true],
			[2, "b", false],
		];
		expect(() => getUniqueValues({ rows, columnIndex: 10 })).toThrow(
			"columnIndex 10 is out of bounds for row length 3.",
		);
	});

	it("excludes null and undefined values", () => {
		const rows = [
			[1, "a", null],
			[2, undefined, false],
			[3, "a", true],
		];
		expect(getUniqueValues({ rows, columnIndex: 1 })).toEqual(["a"]);
	});

	it("handles boolean values correctly", () => {
		const rows = [
			[1, true, "x"],
			[2, false, "y"],
			[3, true, "z"],
		];
		expect(getUniqueValues({ rows, columnIndex: 1 })).toEqual([true, false]);
	});
});
