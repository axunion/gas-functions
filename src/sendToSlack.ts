/**
 * Sends a message to a Slack channel using the Slack API.
 */
function sendToSlack(params: {
	token: string;
	channel: string;
	text: string;
}): GoogleAppsScript.URL_Fetch.HTTPResponse {
	const API = "https://slack.com/api/chat.postMessage";
	const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
		method: "post",
		contentType: "application/json",
		headers: {
			Authorization: `Bearer ${params.token}`,
		},
		payload: JSON.stringify({
			channel: params.channel,
			text: params.text,
		}),
	};

	try {
		const response = UrlFetchApp.fetch(API, options);
		const responseData = JSON.parse(response.getContentText());

		if (!responseData.ok) {
			throw new Error(`Slack API error: ${responseData.error}`);
		}

		return response;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : error;
		throw new Error(`Failed to send message to Slack: ${errorMessage}`);
	}
}

export { sendToSlack };
