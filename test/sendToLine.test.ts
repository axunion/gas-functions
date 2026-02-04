import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendToLine } from "../src/sendToLine";
import {
	mockFetchHttpError,
	mockFetchNetworkError,
	mockFetchSuccess,
	mockUrlFetchApp,
	setupUrlFetchApp,
} from "./mocks";

beforeEach(() => {
	setupUrlFetchApp();
	vi.clearAllMocks();
});

describe("sendToLine", () => {
	describe("validation", () => {
		it("throws if channelAccessToken is empty", () => {
			expect(() =>
				sendToLine({
					channelAccessToken: "",
					targetId: "group123",
					text: "hello",
				}),
			).toThrow("LINE channel access token is required");
		});

		it("throws if channelAccessToken is whitespace only", () => {
			expect(() =>
				sendToLine({
					channelAccessToken: "   ",
					targetId: "group123",
					text: "hello",
				}),
			).toThrow("LINE channel access token is required");
		});

		it("throws if targetId is empty", () => {
			expect(() =>
				sendToLine({
					channelAccessToken: "token123",
					targetId: "",
					text: "hello",
				}),
			).toThrow("LINE target ID is required");
		});

		it("throws if targetId is whitespace only", () => {
			expect(() =>
				sendToLine({
					channelAccessToken: "token123",
					targetId: "   ",
					text: "hello",
				}),
			).toThrow("LINE target ID is required");
		});

		it("throws if text is not a string", () => {
			expect(() =>
				sendToLine({
					channelAccessToken: "token123",
					targetId: "group123",
					text: 123 as unknown as string,
				}),
			).toThrow("LINE message text must be a string");
		});

		it("allows empty text string", () => {
			mockFetchSuccess({ sentMessages: [{ id: "1", quoteToken: "qt" }] });
			expect(() =>
				sendToLine({
					channelAccessToken: "token123",
					targetId: "group123",
					text: "",
				}),
			).not.toThrow();
		});
	});

	describe("successful requests", () => {
		it("sends message and returns response", () => {
			mockFetchSuccess({ sentMessages: [{ id: "1", quoteToken: "qt" }] });

			const result = sendToLine({
				channelAccessToken: "test-token",
				targetId: "C1234567890",
				text: "Hello, World!",
			});

			expect(mockUrlFetchApp.fetch).toHaveBeenCalledTimes(1);
			expect(mockUrlFetchApp.fetch).toHaveBeenCalledWith(
				"https://api.line.me/v2/bot/message/push",
				expect.objectContaining({
					method: "post",
					contentType: "application/json; charset=utf-8",
					headers: { Authorization: "Bearer test-token" },
					muteHttpExceptions: true,
				}),
			);
			expect(result.getResponseCode()).toBe(200);
		});

		it("includes correct payload structure", () => {
			mockFetchSuccess({ sentMessages: [{ id: "1", quoteToken: "qt" }] });

			sendToLine({
				channelAccessToken: "token123",
				targetId: "C1234567890",
				text: "Test message",
			});

			const callArgs = mockUrlFetchApp.fetch.mock.calls[0];
			const payload = JSON.parse(callArgs[1]?.payload as string);

			expect(payload).toEqual({
				to: "C1234567890",
				messages: [{ type: "text", text: "Test message" }],
			});
		});
	});

	describe("error handling", () => {
		it("throws on HTTP error status", () => {
			mockFetchHttpError(400, { message: "The request body has 1 error(s)" });

			expect(() =>
				sendToLine({
					channelAccessToken: "token",
					targetId: "group123",
					text: "msg",
				}),
			).toThrow("LINE API request failed. Status: 400");
		});

		it("throws on network failure", () => {
			mockFetchNetworkError("Connection refused");

			expect(() =>
				sendToLine({
					channelAccessToken: "token",
					targetId: "group123",
					text: "msg",
				}),
			).toThrow("Failed to execute LINE API call");
		});

		it("throws on invalid JSON response", () => {
			mockUrlFetchApp.fetch.mockReturnValue({
				getResponseCode: () => 200,
				getContentText: () => "not json",
				getAllHeaders: () => ({}),
				getAs: vi.fn(),
				getBlob: vi.fn(),
				getContent: vi.fn(),
				getHeaders: () => ({}),
			});

			expect(() =>
				sendToLine({
					channelAccessToken: "token",
					targetId: "group123",
					text: "msg",
				}),
			).toThrow("Failed to parse LINE API response");
		});

		it("throws on LINE API error in response body", () => {
			mockFetchSuccess({ message: "Invalid reply token" });

			expect(() =>
				sendToLine({
					channelAccessToken: "token",
					targetId: "group123",
					text: "msg",
				}),
			).toThrow("LINE API returned an error");
		});
	});
});
