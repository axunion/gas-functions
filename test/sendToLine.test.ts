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
	vi.clearAllMocks();
	setupUrlFetchApp();
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

		it("propagates the UrlFetchApp error on network failure", () => {
			mockFetchNetworkError("Connection refused");

			expect(() =>
				sendToLine({
					channelAccessToken: "token",
					targetId: "group123",
					text: "msg",
				}),
			).toThrow("Connection refused");
		});
	});
});
