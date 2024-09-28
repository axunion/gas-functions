import { describe, it, expect } from "vitest";
import { sendToSlack } from "../src/sendToSlack";

describe("sendToSlack (real API test)", () => {
  const validParams = {
    token: "",
    channel: "",
    text: "",
  };

  it("should successfully send a message to Slack (real API)", () => {
    const response = sendToSlack(validParams);
    const responseData = JSON.parse(response.getContentText());
    expect(responseData.ok).toBe(true);
  });

  it("should throw an error with invalid token", () => {
    const invalidParams = {
      token: "invalid-token",
      channel: validParams.channel,
      text: validParams.text,
    };

    expect(() => sendToSlack(invalidParams)).toThrowError();
  });
});
