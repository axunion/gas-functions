/**
 * Sends a text message to a LINE chat using the LINE Messaging API (push message).
 *
 * @param params - Parameters for sending the LINE message.
 * @param params.channelAccessToken - The LINE channel access token. Must not be empty.
 * @param params.targetId - The target ID (user, group, or room). Must not be empty.
 * @param params.text - The text of the message to send. Can be an empty string.
 * @returns The HTTPResponse object from the LINE API call if successful.
 * @throws Error if `channelAccessToken` or `targetId` is empty, if the LINE API call fails (e.g., network issue), or if the API returns an error.
 */
function sendToLine(params: {
	channelAccessToken: string;
	targetId: string;
	text: string;
}): GoogleAppsScript.URL_Fetch.HTTPResponse {
	const { channelAccessToken, targetId, text } = params;

	if (
		!channelAccessToken ||
		typeof channelAccessToken !== "string" ||
		channelAccessToken.trim() === ""
	) {
		throw new Error(
			"LINE channel access token is required and must be a non-empty string.",
		);
	}

	if (!targetId || typeof targetId !== "string" || targetId.trim() === "") {
		throw new Error(
			"LINE target ID is required and must be a non-empty string.",
		);
	}

	if (typeof text !== "string") {
		throw new Error("LINE message text must be a string.");
	}

	const API_URL = "https://api.line.me/v2/bot/message/push";
	const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
		method: "post",
		contentType: "application/json; charset=utf-8",
		headers: {
			Authorization: `Bearer ${channelAccessToken}`,
		},
		payload: JSON.stringify({
			to: targetId,
			messages: [{ type: "text", text: text }],
		}),
		muteHttpExceptions: true,
	};

	let response: GoogleAppsScript.URL_Fetch.HTTPResponse;

	try {
		response = UrlFetchApp.fetch(API_URL, options);
	} catch (e) {
		throw new Error(`Failed to execute LINE API call: ${e.message}`);
	}

	const responseCode = response.getResponseCode();
	const responseBody = response.getContentText();

	if (responseCode !== 200) {
		throw new Error(
			`LINE API request failed. Status: ${responseCode}. Body: ${responseBody}`,
		);
	}

	let responseData: { message?: string; [key: string]: unknown };

	try {
		responseData = JSON.parse(responseBody);
	} catch (e) {
		throw new Error(
			`Failed to parse LINE API response. Status: ${responseCode}. Body: ${responseBody}. Error: ${e.message}`,
		);
	}

	if (responseData.message) {
		throw new Error(
			`LINE API returned an error. Error: ${responseData.message}. Status: ${responseCode}. Body: ${responseBody}`,
		);
	}

	return response;
}

export { sendToLine };
