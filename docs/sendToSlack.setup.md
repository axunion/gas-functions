# sendToSlack Setup Guide

Prerequisites for sending messages to Slack using the `chat.postMessage` API.

## 1. Create a Slack App

1. Go to [Slack API: Your Apps](https://api.slack.com/apps) and click **Create New App**
2. Choose **From scratch**, give it a name, and select your workspace
3. Navigate to **OAuth & Permissions** in the sidebar

## 2. Configure Bot Token Scopes

Under **OAuth & Permissions** > **Scopes** > **Bot Token Scopes**, add:

- `chat:write` — required to post messages

## 3. Install the App to Your Workspace

1. At the top of **OAuth & Permissions**, click **Install to Workspace** and authorize
2. Copy the **Bot User OAuth Token** (`xoxb-...`) — this is the `token` parameter

## 4. Get the Channel ID

1. Open Slack and right-click the target channel
2. Select **View channel details**
3. At the bottom of the details panel, copy the **Channel ID** (e.g., `C1234567890`)

Note: Invite the bot to the channel first (`/invite @your-bot-name`), or the API will return `channel_not_found`.

## 5. Usage in GAS

```javascript
function notifySlack() {
  sendToSlack({
    token: "xoxb-YOUR-BOT-TOKEN",
    channel: "C1234567890",
    text: "Task completed.",
  });
}
```
