import { describe, it, expect } from "vitest";
import { validateParameters } from "../src/validateParameters";

describe("validateParameters", () => {
  it("should return no errors for valid parameters", () => {
    const parameters = {
      param1: "validString",
      param2: ["valid", "string", "array"],
    };
    const acceptedRows = [
      { name: "param1", maxlength: 20, required: true },
      { name: "param2", maxlength: 50, required: true },
    ];

    const result = validateParameters(parameters, acceptedRows);

    expect(result.errors).toHaveLength(0);
    expect(result.values).toEqual(["validString", "valid,string,array"]);
  });

  it("should return an error if a required parameter is missing", () => {
    const parameters = {
      param1: "",
    };
    const acceptedRows = [{ name: "param1", maxlength: 20, required: true }];

    const result = validateParameters(parameters, acceptedRows);

    expect(result.errors).toContain('"param1" is required.');
    expect(result.values).toHaveLength(0);
  });

  it("should return an error if a parameter exceeds the maximum length", () => {
    const parameters = {
      param1: "thisStringIsWayTooLong",
    };
    const acceptedRows = [{ name: "param1", maxlength: 10, required: false }];

    const result = validateParameters(parameters, acceptedRows);

    expect(result.errors).toContain(
      '"param1" is too long. Maximum length is 10.',
    );
    expect(result.values).toHaveLength(0);
  });

  it("should return an error if an array parameter contains non-string elements", () => {
    const parameters = {
      param1: ["valid", "string", 123],
    } as Record<string, string[]>;
    const acceptedRows = [{ name: "param1", maxlength: 50, required: false }];

    const result = validateParameters(parameters, acceptedRows);

    expect(result.errors).toContain('"param1" contains non-string elements.');
    expect(result.values).toHaveLength(0);
  });

  it("should return no errors for optional parameters", () => {
    const parameters = {
      param1: "",
    };
    const acceptedRows = [{ name: "param1", maxlength: 20, required: false }];

    const result = validateParameters(parameters, acceptedRows);

    expect(result.errors).toHaveLength(0);
    expect(result.values).toHaveLength(1);
  });
});
