type SendToSlackParams = {
  token: string;
  channel: string;
  text: string;
};

function sendToSlack(
  params: SendToSlackParams,
): GoogleAppsScript.URL_Fetch.HTTPResponse {
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
    throw `Failed to send message to Slack: ${error.message}`;
  }
}

export { sendToSlack };
