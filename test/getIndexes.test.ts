import { describe, expect, it } from "vitest";
import { getIndexes } from "../src/getIndexes";

describe("getIndexes", () => {
	it("returns indexes for specified names", () => {
		const row = ["ID", "Name", "Age", "Gender"];
		const names = ["Name", "Age"];
		expect(getIndexes({ row, names })).toEqual([1, 2]);
	});

	it("returns -1 for names that are not found", () => {
		const row = ["ID", "Name", "Age", "Gender"];
		const names = ["Name", "Address"];
		expect(getIndexes({ row, names })).toEqual([1, -1]);
	});

	it("returns empty array if names is empty", () => {
		const row = ["ID", "Name", "Age", "Gender"];
		expect(getIndexes({ row, names: [] })).toEqual([]);
	});

	it("returns empty array when row is empty", () => {
		const names = ["Name", "Age"];
		expect(getIndexes({ row: [], names })).toEqual([]);
	});

	it("returns -1 for all names when none are found", () => {
		const row = ["ID", "Name", "Age", "Gender"];
		const names = ["Address", "Phone", "Email"];
		expect(getIndexes({ row, names })).toEqual([-1, -1, -1]);
	});
});
