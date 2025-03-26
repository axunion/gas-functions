import { describe, it, expect } from "vitest";
import { getIndexes } from "../src/getIndexes";

describe("getIndexes", () => {
	it("should return indexes for specified names", () => {
		const row: string[] = ["ID", "Name", "Age", "Gender"];
		const names = ["Name", "Age"];
		const result = getIndexes({ row, names });
		expect(result).toEqual([1, 2]);
	});

	it("should return -1 for names that are not found", () => {
		const row: string[] = ["ID", "Name", "Age", "Gender"];
		const names = ["Name", "Address"];
		const result = getIndexes({ row, names });
		expect(result).toEqual([1, -1]);
	});

	it("should return empty array if names is empty", () => {
		const row: string[] = ["ID", "Name", "Age", "Gender"];
		const names: string[] = [];
		const result = getIndexes({ row, names });
		expect(result).toEqual([]);
	});

	it("should return -1 for each name when row array is empty", () => {
		const row: string[] = [];
		const names = ["Name", "Age"];
		const result = getIndexes({ row, names });
		expect(result).toEqual([-1, -1]);
	});

	it("should handle case where some names are not found", () => {
		const row: string[] = ["ID", "Name", "Age", "Gender"];
		const names = ["Name", "Unknown"];
		const result = getIndexes({ row, names });
		expect(result).toEqual([1, -1]);
	});
});
