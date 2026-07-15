# sendToSlack セットアップガイド

Slack の `chat.postMessage` API を使用してメッセージを送信するための事前準備手順です。

## 1. Slack アプリの作成

1. [Slack API: Your Apps](https://api.slack.com/apps) を開き、**Create New App** をクリック
2. **From scratch** を選択し、アプリ名を入力して対象のワークスペースを選択
3. サイドバーの **OAuth & Permissions** を開く

## 2. Bot Token Scopes の設定

**OAuth & Permissions** > **Scopes** > **Bot Token Scopes** で以下を追加:

- `chat:write` — メッセージ投稿に必須

## 3. ワークスペースへのアプリのインストール

1. **OAuth & Permissions** 上部の **Install to Workspace** をクリックして承認
2. **Bot User OAuth Token**（`xoxb-...`）をコピー — これが `token` パラメータになる

## 4. チャンネル ID の取得

1. Slack で対象チャンネルを右クリック
2. **チャンネル詳細を表示** を選択
3. 詳細パネル最下部の **チャンネル ID**（例: `C1234567890`）をコピー

注意: 先にボットをチャンネルに招待しておくこと（`/invite @ボット名`）。招待していないと API が `channel_not_found` を返す。

## 5. GAS での使用例

```javascript
function notifySlack() {
  sendToSlack({
    token: "xoxb-YOUR-BOT-TOKEN",
    channel: "C1234567890",
    text: "タスクが完了しました",
  });
}
```
