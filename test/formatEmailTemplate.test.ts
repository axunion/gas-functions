import { describe, it, expect } from "vitest";
import { formatEmailTemplate } from "../src/formatEmailTemplate";

describe("formatEmailTemplate", () => {
	it("should replace a single placeholder", () => {
		const template = "Hello, {{name}}!";
		const data = { name: "Alice" };
		const result = formatEmailTemplate(template, data);
		expect(result).toBe("Hello, Alice!");
	});

	it("should leave placeholder unchanged if key not found", () => {
		const template = "Hello, {{name}}!";
		const data = {};
		const result = formatEmailTemplate(template, data);
		expect(result).toBe("Hello, {{name}}!");
	});

	it("should replace multiple placeholders", () => {
		const template = "Hello, {{firstName}} {{lastName}}!";
		const data = { firstName: "John", lastName: "Doe" };
		const result = formatEmailTemplate(template, data);
		expect(result).toBe("Hello, John Doe!");
	});

	it("should replace numeric values correctly", () => {
		const template = "Your age is {{age}}.";
		const data = { age: 30 };
		const result = formatEmailTemplate(template, data);
		expect(result).toBe("Your age is 30.");
	});

	it("should handle extra whitespace in placeholder keys", () => {
		const template = "Hello, {{ name }}!";
		const data = { name: "Bob" };
		const result = formatEmailTemplate(template, data);
		expect(result).toBe("Hello, Bob!");
	});

	it("should correctly replace values even if they are falsy (0 or empty string)", () => {
		const template = "Count: {{count}}, Message: {{message}}";
		const data = { count: 0, message: "" };
		const result = formatEmailTemplate(template, data);
		expect(result).toBe("Count: 0, Message: ");
	});

	it("should not replace when placeholder is empty (if not matched by regex)", () => {
		const template = "Empty placeholder: {{}}, text.";
		const data = { "": "value" };
		const result = formatEmailTemplate(template, data);
		expect(result).toBe("Empty placeholder: {{}}, text.");
	});
});
