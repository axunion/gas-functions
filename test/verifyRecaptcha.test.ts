import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyRecaptcha } from "../src/verifyRecaptcha";
import {
	mockFetchHttpError,
	mockFetchInvalidJson,
	mockFetchNetworkError,
	mockFetchSuccess,
	mockUrlFetchApp,
	setupUrlFetchApp,
} from "./mocks";

const validResponse = {
	success: true,
	score: 0.9,
	action: "submit",
	challenge_ts: "2024-01-01T00:00:00Z",
	hostname: "example.com",
};

beforeEach(() => {
	vi.clearAllMocks();
	setupUrlFetchApp();
});

describe("verifyRecaptcha", () => {
	describe("validation", () => {
		it("throws if secret is empty", () => {
			expect(() => verifyRecaptcha({ secret: "", token: "token" })).toThrow(
				"reCAPTCHA secret must be a non-empty string",
			);
		});

		it("throws if secret is whitespace only", () => {
			expect(() => verifyRecaptcha({ secret: "   ", token: "token" })).toThrow(
				"reCAPTCHA secret must be a non-empty string",
			);
		});

		it("throws if token is empty", () => {
			expect(() => verifyRecaptcha({ secret: "secret", token: "" })).toThrow(
				"reCAPTCHA token must be a non-empty string",
			);
		});

		it("throws if scoreThreshold is below 0", () => {
			expect(() =>
				verifyRecaptcha({
					secret: "secret",
					token: "token",
					scoreThreshold: -0.1,
				}),
			).toThrow("scoreThreshold must be a number between 0.0 and 1.0");
		});

		it("throws if scoreThreshold is above 1", () => {
			expect(() =>
				verifyRecaptcha({
					secret: "secret",
					token: "token",
					scoreThreshold: 1.1,
				}),
			).toThrow("scoreThreshold must be a number between 0.0 and 1.0");
		});
	});

	describe("successful verification", () => {
		it("returns response on valid verification", () => {
			mockFetchSuccess(validResponse);

			const result = verifyRecaptcha({ secret: "secret", token: "token" });

			expect(result).toEqual(validResponse);
		});

		it("calls API with correct parameters", () => {
			mockFetchSuccess(validResponse);

			verifyRecaptcha({ secret: "my-secret", token: "user-token" });

			expect(mockUrlFetchApp.fetch).toHaveBeenCalledWith(
				"https://www.google.com/recaptcha/api/siteverify",
				expect.objectContaining({
					method: "post",
					payload: {
						secret: "my-secret",
						response: "user-token",
					},
				}),
			);
		});

		it("uses default scoreThreshold of 0.5", () => {
			mockFetchSuccess({ ...validResponse, score: 0.5 });

			expect(() =>
				verifyRecaptcha({ secret: "secret", token: "token" }),
			).not.toThrow();
		});

		it("passes with score equal to threshold", () => {
			mockFetchSuccess({ ...validResponse, score: 0.7 });

			expect(() =>
				verifyRecaptcha({
					secret: "secret",
					token: "token",
					scoreThreshold: 0.7,
				}),
			).not.toThrow();
		});
	});

	describe("error handling", () => {
		it("propagates the UrlFetchApp error on network failure", () => {
			mockFetchNetworkError("Connection timeout");

			expect(() =>
				verifyRecaptcha({ secret: "secret", token: "token" }),
			).toThrow("Connection timeout");
		});

		it("throws on HTTP error status", () => {
			mockFetchHttpError(500, "Internal Server Error");

			expect(() =>
				verifyRecaptcha({ secret: "secret", token: "token" }),
			).toThrow("reCAPTCHA API returned HTTP 500");
		});

		it("throws when verification fails", () => {
			mockFetchSuccess({
				success: false,
				"error-codes": ["invalid-input-secret"],
			});

			expect(() =>
				verifyRecaptcha({ secret: "secret", token: "token" }),
			).toThrow("reCAPTCHA verification failed (invalid-input-secret)");
		});

		it("treats a response without success field as failed verification", () => {
			mockFetchSuccess({ score: 0.9 });

			expect(() =>
				verifyRecaptcha({ secret: "secret", token: "token" }),
			).toThrow("reCAPTCHA verification failed");
		});

		it("throws when score is below threshold", () => {
			mockFetchSuccess({ ...validResponse, score: 0.3 });

			expect(() =>
				verifyRecaptcha({
					secret: "secret",
					token: "token",
					scoreThreshold: 0.5,
				}),
			).toThrow("reCAPTCHA score 0.3 is below threshold 0.5");
		});

		it("throws on missing score field", () => {
			mockFetchSuccess({ success: true });

			expect(() =>
				verifyRecaptcha({ secret: "secret", token: "token" }),
			).toThrow("Invalid reCAPTCHA response: missing or invalid 'score' field");
		});

		it("propagates the JSON parse error on invalid JSON response", () => {
			mockFetchInvalidJson();

			expect(() =>
				verifyRecaptcha({ secret: "secret", token: "token" }),
			).toThrow(SyntaxError);
		});
	});
});
