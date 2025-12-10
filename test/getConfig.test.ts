import { beforeEach, describe, expect, it, vi } from "vitest";
import { getConfig } from "../src/getConfig";
import { setupSpreadsheetApp } from "./mocks";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getConfig", () => {
	describe("successful retrieval", () => {
		it("returns config with fileId, sheetName, and fieldConfigs", () => {
			setupSpreadsheetApp({
				spreadsheets: {
					"config-file-id": {
						id: "config-file-id",
						sheets: [
							{
								name: "config",
								data: [
									["header", "type", "fileId", "sheetName"],
									["", "contact-form", "target-file-123", "Responses"],
								],
							},
							{
								name: "contact-form",
								data: [
									["name", "maxlength", "required"],
									["email", "255", "true"],
									["message", "1000", "false"],
									["phone", "20", "TRUE"],
								],
							},
						],
					},
				},
			});

			const result = getConfig("config-file-id", "contact-form");

			expect(result).toEqual({
				fileId: "target-file-123",
				sheetName: "Responses",
				fieldConfigs: [
					{ name: "email", maxlength: 255, required: true },
					{ name: "message", maxlength: 1000, required: false },
					{ name: "phone", maxlength: 20, required: true },
				],
			});
		});

		it("handles empty maxlength as 0", () => {
			setupSpreadsheetApp({
				spreadsheets: {
					"config-file-id": {
						id: "config-file-id",
						sheets: [
							{
								name: "config",
								data: [
									["header", "type", "fileId", "sheetName"],
									["", "form", "file-id", "Sheet1"],
								],
							},
							{
								name: "form",
								data: [
									["name", "maxlength", "required"],
									["field1", "", "false"],
								],
							},
						],
					},
				},
			});

			const result = getConfig("config-file-id", "form");

			expect(result.fieldConfigs[0].maxlength).toBe(0);
		});

		it("handles various falsy required values as false", () => {
			setupSpreadsheetApp({
				spreadsheets: {
					"config-file-id": {
						id: "config-file-id",
						sheets: [
							{
								name: "config",
								data: [
									["header", "type", "fileId", "sheetName"],
									["", "form", "file-id", "Sheet1"],
								],
							},
							{
								name: "form",
								data: [
									["name", "maxlength", "required"],
									["field1", "100", "false"],
									["field2", "100", "FALSE"],
									["field3", "100", ""],
									["field4", "100", "no"],
								],
							},
						],
					},
				},
			});

			const result = getConfig("config-file-id", "form");

			expect(result.fieldConfigs[0].required).toBe(false);
			expect(result.fieldConfigs[1].required).toBe(false);
			expect(result.fieldConfigs[2].required).toBe(false);
			expect(result.fieldConfigs[3].required).toBe(false);
		});

		it("trims whitespace from values", () => {
			setupSpreadsheetApp({
				spreadsheets: {
					"config-file-id": {
						id: "config-file-id",
						sheets: [
							{
								name: "config",
								data: [
									["header", "type", "fileId", "sheetName"],
									["", "form", "  file-id  ", "  Sheet1  "],
								],
							},
							{
								name: "form",
								data: [
									["name", "maxlength", "required"],
									["  fieldName  ", "  100  ", "  true  "],
								],
							},
						],
					},
				},
			});

			const result = getConfig("config-file-id", "form");

			expect(result.fileId).toBe("file-id");
			expect(result.sheetName).toBe("Sheet1");
			expect(result.fieldConfigs[0].name).toBe("fieldName");
			expect(result.fieldConfigs[0].required).toBe(true);
		});
	});

	describe("error handling", () => {
		it("throws if spreadsheet is not found", () => {
			setupSpreadsheetApp({ spreadsheets: {} });

			expect(() => getConfig("non-existent-id", "form")).toThrow(
				"Spreadsheet not found",
			);
		});

		it("throws if field sheet is not found", () => {
			setupSpreadsheetApp({
				spreadsheets: {
					"config-file-id": {
						id: "config-file-id",
						sheets: [
							{
								name: "config",
								data: [
									["header", "type", "fileId", "sheetName"],
									["", "form", "file-id", "Sheet1"],
								],
							},
						],
					},
				},
			});

			expect(() => getConfig("config-file-id", "form")).toThrow(
				"Field sheet not found: sheet='form'",
			);
		});

		it("throws if config sheet is not found", () => {
			setupSpreadsheetApp({
				spreadsheets: {
					"config-file-id": {
						id: "config-file-id",
						sheets: [
							{ name: "other-sheet", data: [] },
							{ name: "form", data: [["name", "maxlength", "required"]] },
						],
					},
				},
			});

			expect(() => getConfig("config-file-id", "form")).toThrow(
				"Config sheet not found: sheet='config'",
			);
		});

		it("throws if config sheet is empty", () => {
			setupSpreadsheetApp({
				spreadsheets: {
					"config-file-id": {
						id: "config-file-id",
						sheets: [
							{ name: "config", data: [] },
							{ name: "form", data: [["name", "maxlength", "required"]] },
						],
					},
				},
			});

			expect(() => getConfig("config-file-id", "form")).toThrow(
				"Config sheet is empty",
			);
		});

		it("throws if config type is not found", () => {
			setupSpreadsheetApp({
				spreadsheets: {
					"config-file-id": {
						id: "config-file-id",
						sheets: [
							{
								name: "config",
								data: [
									["header", "type", "fileId", "sheetName"],
									["", "other-form", "file-id", "Sheet1"],
								],
							},
							{ name: "form", data: [["name", "maxlength", "required"]] },
						],
					},
				},
			});

			expect(() => getConfig("config-file-id", "form")).toThrow(
				"Config not found: type='form'",
			);
		});
	});
});
