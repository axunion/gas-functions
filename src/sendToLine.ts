/**
 * Sends a text message to a LINE chat using the LINE Messaging API (push message).
 *
 * @param params - Parameters for sending the LINE message.
 * @param params.channelAccessToken - The LINE channel access token. Must not be empty.
 * @param params.targetId - The target ID (user, group, or room). Must not be empty.
 * @param params.text - The text of the message to send. Can be an empty string.
 * @returns The HTTPResponse object from the LINE API call if successful.
 * @throws Error if `channelAccessToken` or `targetId` is empty, or if the LINE API returns a non-200 status.
 */
function sendToLine(params: {
	channelAccessToken: string;
	targetId: string;
	text: string;
}): GoogleAppsScript.URL_Fetch.HTTPResponse {
	const { channelAccessToken, targetId, text } = params;

	if (!channelAccessToken.trim()) {
		throw new Error(
			"LINE channel access token is required and must be a non-empty string.",
		);
	}

	if (!targetId.trim()) {
		throw new Error(
			"LINE target ID is required and must be a non-empty string.",
		);
	}

	const response = UrlFetchApp.fetch(
		"https://api.line.me/v2/bot/message/push",
		{
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
		},
	);

	const responseCode = response.getResponseCode();

	if (responseCode !== 200) {
		throw new Error(
			`LINE API request failed. Status: ${responseCode}. Body: ${response.getContentText()}`,
		);
	}

	return response;
}

export { sendToLine };
