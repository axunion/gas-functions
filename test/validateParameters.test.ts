import { describe, expect, it } from "vitest";
import { validateParameters } from "../src/validateParameters";

describe("validateParameters", () => {
	it("should return valid values for valid parameters", () => {
		const parameters = {
			param1: "validString",
			param2: ["valid", "string", "array"],
		};
		const acceptedRows = [
			{ name: "param1", maxlength: 20, required: true },
			{ name: "param2", maxlength: 50, required: true },
		];

		const result = validateParameters({
			inputValues: parameters,
			acceptedRows,
		});

		expect(result).toEqual(["validString", "valid,string,array"]);
	});

	it("should throw an error if a required parameter is missing", () => {
		const parameters = {
			param1: "",
		};
		const acceptedRows = [{ name: "param1", maxlength: 20, required: true }];

		expect(() =>
			validateParameters({
				inputValues: parameters,
				acceptedRows,
			}),
		).toThrow('"param1" is required.');
	});

	it("should throw an error if a parameter exceeds the maximum length", () => {
		const parameters = {
			param1: "thisStringIsWayTooLong",
		};
		const acceptedRows = [{ name: "param1", maxlength: 10, required: false }];

		expect(() =>
			validateParameters({
				inputValues: parameters,
				acceptedRows,
			}),
		).toThrow('"param1" is too long. Maximum length is 10.');
	});

	it("should throw an error if an array parameter contains non-string elements", () => {
		const parameters = {
			param1: ["valid", "string", 123],
		} as Record<string, string[]>;
		const acceptedRows = [{ name: "param1", maxlength: 50, required: false }];

		expect(() =>
			validateParameters({
				inputValues: parameters,
				acceptedRows,
			}),
		).toThrow('"param1" contains non-string elements.');
	});

	it("should return values for optional parameters that are not empty", () => {
		const parameters = {
			param1: "validValue",
		};
		const acceptedRows = [{ name: "param1", maxlength: 20, required: false }];

		const result = validateParameters({
			inputValues: parameters,
			acceptedRows,
		});

		expect(result).toEqual(["validValue"]);
	});

	it("should skip empty optional parameters", () => {
		const parameters = {
			param1: "",
			param2: "validValue",
		};
		const acceptedRows = [
			{ name: "param1", maxlength: 20, required: false },
			{ name: "param2", maxlength: 20, required: false },
		];

		const result = validateParameters({
			inputValues: parameters,
			acceptedRows,
		});

		expect(result).toEqual(["validValue"]);
	});

	it("should throw an error if array parameter is too long after joining", () => {
		const parameters = {
			param1: ["very", "long", "array", "that", "exceeds", "limit"],
		};
		const acceptedRows = [{ name: "param1", maxlength: 10, required: false }];

		expect(() =>
			validateParameters({
				inputValues: parameters,
				acceptedRows,
			}),
		).toThrow(
			'"param1" is too long. Maximum length is 10 (after joining array elements).',
		);
	});

	it("should throw an error for invalid parameter types", () => {
		const parameters = {
			param1: 123,
		} as unknown as Record<string, string | string[]>;
		const acceptedRows = [{ name: "param1", maxlength: 20, required: false }];

		expect(() =>
			validateParameters({
				inputValues: parameters,
				acceptedRows,
			}),
		).toThrow(
			'"param1" has an invalid type. Expected string or array of strings.',
		);
	});
});
