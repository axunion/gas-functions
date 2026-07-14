/**
 * Sends a message to a Slack channel using the Slack API.
 *
 * @param params - Parameters for sending the Slack message.
 * @param params.token - The Slack API authentication token (Bearer token). Must not be empty.
 * @param params.channel - The Slack channel ID or name to send the message to. Must not be empty.
 * @param params.text - The text of the message to send. Can be an empty string.
 * @returns The HTTPResponse object from the Slack API call if successful.
 * @throws Error if `token` or `channel` is empty, or if the Slack API returns an error (e.g., invalid token, channel not found).
 */
function sendToSlack(params: {
	token: string;
	channel: string;
	text: string;
}): GoogleAppsScript.URL_Fetch.HTTPResponse {
	const { token, channel, text } = params;

	if (!token.trim()) {
		throw new Error(
			"Slack API token is required and must be a non-empty string.",
		);
	}

	if (!channel.trim()) {
		throw new Error(
			"Slack channel is required and must be a non-empty string.",
		);
	}

	const response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", {
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
	});

	const responseCode = response.getResponseCode();
	const responseBody = response.getContentText();

	if (responseCode !== 200) {
		throw new Error(
			`Slack API request failed. Status: ${responseCode}. Body: ${responseBody}`,
		);
	}

	// Slack returns HTTP 200 even for API errors; failures are reported via the `ok` field
	const responseData: { ok: boolean; error?: string } =
		JSON.parse(responseBody);

	if (!responseData.ok) {
		throw new Error(
			`Slack API returned an error. Error: ${responseData.error || "Unknown error"}. Status: ${responseCode}. Body: ${responseBody}`,
		);
	}

	return response;
}

export { sendToSlack };
