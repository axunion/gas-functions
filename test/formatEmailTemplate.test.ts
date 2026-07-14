import { describe, expect, it } from "vitest";
import { formatEmailTemplate } from "../src/formatEmailTemplate";

describe("formatEmailTemplate", () => {
	it("replaces a single placeholder", () => {
		const result = formatEmailTemplate({
			template: "Hello, {{name}}!",
			data: { name: "Alice" },
		});
		expect(result).toBe("Hello, Alice!");
	});

	it("leaves placeholder unchanged if key not found", () => {
		const result = formatEmailTemplate({
			template: "Hello, {{name}}!",
			data: {},
		});
		expect(result).toBe("Hello, {{name}}!");
	});

	it("replaces multiple placeholders", () => {
		const result = formatEmailTemplate({
			template: "Hello, {{firstName}} {{lastName}}!",
			data: { firstName: "John", lastName: "Doe" },
		});
		expect(result).toBe("Hello, John Doe!");
	});

	it("replaces numeric values correctly", () => {
		const result = formatEmailTemplate({
			template: "Your age is {{age}}.",
			data: { age: 30 },
		});
		expect(result).toBe("Your age is 30.");
	});

	it("handles extra whitespace in placeholder keys", () => {
		const result = formatEmailTemplate({
			template: "Hello, {{ name }}!",
			data: { name: "Bob" },
		});
		expect(result).toBe("Hello, Bob!");
	});

	it("replaces values even if they are falsy (0 or empty string)", () => {
		const result = formatEmailTemplate({
			template: "Count: {{count}}, Message: {{message}}",
			data: { count: 0, message: "" },
		});
		expect(result).toBe("Count: 0, Message: ");
	});

	it("does not replace empty placeholders", () => {
		const result = formatEmailTemplate({
			template: "Empty placeholder: {{}}, text.",
			data: { "": "value" },
		});
		expect(result).toBe("Empty placeholder: {{}}, text.");
	});
});
