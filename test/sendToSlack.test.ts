import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendToSlack } from "../src/sendToSlack";
import {
	mockFetchHttpError,
	mockFetchInvalidJson,
	mockFetchNetworkError,
	mockFetchSuccess,
	mockUrlFetchApp,
	setupUrlFetchApp,
} from "./mocks";

beforeEach(() => {
	vi.clearAllMocks();
	setupUrlFetchApp();
});

describe("sendToSlack", () => {
	describe("validation", () => {
		it("throws if token is empty", () => {
			expect(() =>
				sendToSlack({ token: "", channel: "#general", text: "hello" }),
			).toThrow("Slack API token is required");
		});

		it("throws if token is whitespace only", () => {
			expect(() =>
				sendToSlack({ token: "   ", channel: "#general", text: "hello" }),
			).toThrow("Slack API token is required");
		});

		it("throws if channel is empty", () => {
			expect(() =>
				sendToSlack({ token: "xoxb-token", channel: "", text: "hello" }),
			).toThrow("Slack channel is required");
		});

		it("allows empty text string", () => {
			mockFetchSuccess({ ok: true });
			expect(() =>
				sendToSlack({ token: "xoxb-token", channel: "#general", text: "" }),
			).not.toThrow();
		});
	});

	describe("successful requests", () => {
		it("sends message and returns response", () => {
			mockFetchSuccess({ ok: true, ts: "1234567890.123456" });

			const result = sendToSlack({
				token: "xoxb-test-token",
				channel: "#general",
				text: "Hello, World!",
			});

			expect(mockUrlFetchApp.fetch).toHaveBeenCalledTimes(1);
			expect(mockUrlFetchApp.fetch).toHaveBeenCalledWith(
				"https://slack.com/api/chat.postMessage",
				expect.objectContaining({
					method: "post",
					contentType: "application/json; charset=utf-8",
					headers: { Authorization: "Bearer xoxb-test-token" },
					muteHttpExceptions: true,
				}),
			);
			expect(result.getResponseCode()).toBe(200);
		});

		it("includes correct payload structure", () => {
			mockFetchSuccess({ ok: true });

			sendToSlack({
				token: "xoxb-token",
				channel: "C1234567890",
				text: "Test message",
			});

			const callArgs = mockUrlFetchApp.fetch.mock.calls[0];
			const payload = JSON.parse(callArgs[1]?.payload as string);

			expect(payload).toEqual({
				channel: "C1234567890",
				text: "Test message",
			});
		});
	});

	describe("error handling", () => {
		it("throws on HTTP error status", () => {
			mockFetchHttpError(500, { error: "server_error" });

			expect(() =>
				sendToSlack({ token: "token", channel: "#test", text: "msg" }),
			).toThrow("Slack API request failed. Status: 500");
		});

		it("throws on Slack API error response", () => {
			mockFetchSuccess({ ok: false, error: "channel_not_found" });

			expect(() =>
				sendToSlack({ token: "token", channel: "#invalid", text: "msg" }),
			).toThrow("channel_not_found");
		});

		it("propagates the UrlFetchApp error on network failure", () => {
			mockFetchNetworkError("Connection refused");

			expect(() =>
				sendToSlack({ token: "token", channel: "#test", text: "msg" }),
			).toThrow("Connection refused");
		});

		it("propagates the JSON parse error on invalid JSON response", () => {
			mockFetchInvalidJson();

			expect(() =>
				sendToSlack({ token: "token", channel: "#test", text: "msg" }),
			).toThrow(SyntaxError);
		});
	});
});
