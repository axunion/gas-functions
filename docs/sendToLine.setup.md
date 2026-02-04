# sendToLine セットアップガイド

LINE Messaging API を使用してメッセージを送信するための事前準備手順です。

## 1. LINE Developers Console での準備

1. [LINE Developers Console](https://developers.line.biz/console/) にログイン
2. プロバイダーを作成（未作成の場合）
3. 「Messaging API」チャネルを新規作成
4. チャネルの「Messaging API」タブで **Channel Access Token（長期）** を発行
5. 同タブで「**グループ・複数人トークへの参加を許可する**」を有効化

## 2. グループ ID の取得方法

グループにメッセージを送信するには、グループ ID が必要です。

### Webhook を使った取得手順

1. LINE Developers Console でチャネルの「Messaging API」タブを開く
2. Webhook URL を設定する（例: GAS の Web アプリ URL）
3. Webhook の利用をオンにする
4. LINE Official Account（ボット）を対象のグループに招待する
5. 招待時に Webhook に送信されるイベントの `source.groupId` から ID を取得・保存する

### GAS で Webhook を受け取る例

```javascript
function doPost(e) {
  const events = JSON.parse(e.postData.contents).events;
  for (const event of events) {
    if (event.source.type === "group") {
      Logger.log("Group ID: " + event.source.groupId);
    }
  }
  return ContentService.createTextOutput("OK");
}
```

## 3. 無料プランの制限

- 月 **200 通**まで無料（送信先人数 × メッセージ数でカウント）
- 例: 10 人のグループに 1 回送信 = 10 通としてカウント

## 4. GAS での使用例

```javascript
function notifyLine() {
  sendToLine({
    channelAccessToken: "YOUR_CHANNEL_ACCESS_TOKEN",
    targetId: "YOUR_GROUP_ID",
    text: "タスクが完了しました",
  });
}
```
