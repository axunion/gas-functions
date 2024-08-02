import { describe, it, expect } from "vitest";
import { formatEmailTemplate } from "../src/formatEmailTemplate";

describe("formatEmailTemplate", () => {
  it("should replace placeholders with corresponding data", () => {
    const template = "Hello {{ name }}, your order {{ orderId }} is confirmed.";
    const data = { name: "Alice", orderId: 12345 };
    const result = formatEmailTemplate(template, data);
    expect(result).toBe("Hello Alice, your order 12345 is confirmed.");
  });

  it("should leave placeholders that do not have corresponding data", () => {
    const template = "Hello {{ name }}, your order {{ orderId }} is confirmed.";
    const data = { name: "Alice" };
    const result = formatEmailTemplate(template, data);
    expect(result).toBe("Hello Alice, your order {{ orderId }} is confirmed.");
  });

  it("should handle multiple placeholders correctly", () => {
    const template =
      "Dear {{ title }} {{ name }}, your balance is {{ balance }}.";
    const data = { title: "Dr.", name: "Smith", balance: 100.5 };
    const result = formatEmailTemplate(template, data);
    expect(result).toBe("Dear Dr. Smith, your balance is 100.5.");
  });

  it("should handle empty data object", () => {
    const template = "Hello {{ name }}, your order {{ orderId }} is confirmed.";
    const data = {};
    const result = formatEmailTemplate(template, data);
    expect(result).toBe(
      "Hello {{ name }}, your order {{ orderId }} is confirmed.",
    );
  });

  it("should handle templates without placeholders", () => {
    const template = "Hello, welcome!";
    const data = { name: "Alice" };
    const result = formatEmailTemplate(template, data);
    expect(result).toBe("Hello, welcome!");
  });
});
