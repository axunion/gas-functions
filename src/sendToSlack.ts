/**
 * Sends a message to a Slack channel using the Slack API.
 *
 * @param params - Parameters for sending the Slack message.
 * @param params.token - The Slack API authentication token (Bearer token). Must not be empty.
 * @param params.channel - The Slack channel ID or name to send the message to. Must not be empty.
 * @param params.text - The text of the message to send. Can be an empty string.
 * @returns The HTTPResponse object from the Slack API call if successful.
 * @throws Error if `token` or `channel` is empty, if the Slack API call fails (e.g., network issue), or if the API returns an error (e.g., invalid token, channel not found).
 */
function sendToSlack(params: {
	token: string;
	channel: string;
	text: string;
}): GoogleAppsScript.URL_Fetch.HTTPResponse {
	const { token, channel, text } = params;

	if (!token || typeof token !== "string" || token.trim() === "") {
		throw new Error(
			"Slack API token is required and must be a non-empty string.",
		);
	}

	if (!channel || typeof channel !== "string" || channel.trim() === "") {
		throw new Error(
			"Slack channel is required and must be a non-empty string.",
		);
	}

	// `text` can be an empty string, so no validation for emptiness, but ensure it's a string.
	if (typeof text !== "string") {
		throw new Error("Slack message text must be a string.");
	}

	const API_URL = "https://slack.com/api/chat.postMessage";
	const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
		method: "post",
		contentType: "application/json; charset=utf-8",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		payload: JSON.stringify({
			channel: channel,
			text: text,
		}),
		muteHttpExceptions: true,
	};

	let response: GoogleAppsScript.URL_Fetch.HTTPResponse;

	try {
		response = UrlFetchApp.fetch(API_URL, options);
	} catch (e) {
		// Catch network errors or other issues with UrlFetchApp.fetch itself
		throw new Error(`Failed to execute Slack API call: ${e.message}`);
	}

	const responseCode = response.getResponseCode();
	const responseBody = response.getContentText();

	if (responseCode !== 200) {
		throw new Error(
			`Slack API request failed. Status: ${responseCode}. Body: ${responseBody}`,
		);
	}

	let responseData: { ok: boolean; error?: string; [key: string]: unknown };

	try {
		responseData = JSON.parse(responseBody);
	} catch (e) {
		throw new Error(
			`Failed to parse Slack API response. Status: ${responseCode}. Body: ${responseBody}. Error: ${e.message}`,
		);
	}

	if (!responseData.ok) {
		throw new Error(
			`Slack API returned an error. Error: ${responseData.error || "Unknown error"}. Status: ${responseCode}. Body: ${responseBody}`,
		);
	}

	return response; // Return the original HTTPResponse object on success
}

export { sendToSlack };
