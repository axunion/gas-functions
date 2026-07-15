# sendToLine セットアップガイド

LINE Messaging API を使用してメッセージを送信するための事前準備手順です。

## 1. LINE 公式アカウントと Messaging API チャネルの準備

2024 年 9 月 4 日以降、LINE Developers Console から Messaging API チャネルを直接作成することはできません。先に LINE 公式アカウントを作成し、そこから Messaging API を有効化します。

1. [LINE Official Account Manager](https://manager.line.biz/) で LINE 公式アカウントを作成（2025 年 6 月 25 日以降、新規作成にはビジネスマネージャーとの接続が必須）
2. LINE Official Account Manager の「設定」→「Messaging API」から Messaging API を有効化（このときプロバイダーを選択。**後から変更・連携解除はできない**ため慎重に選ぶ）
3. [LINE Developers Console](https://developers.line.biz/console/) にログインし、作成された Messaging API チャネルを開く
4. チャネルの「Messaging API」タブで **チャネルアクセストークン（長期）** を発行
5. LINE Official Account Manager の「設定」→「アカウント設定」→「機能の利用」で「**グループ・複数人トークへの参加を許可する**」を有効化（未設定だとボットをグループに招待しても自動退出する）

## 2. グループ ID の取得方法

グループにメッセージを送信するには、グループ ID が必要です。

### Webhook を使った取得手順

1. LINE Developers Console でチャネルの「Messaging API」タブを開く
2. Webhook URL を設定する（例: GAS の Web アプリ URL）
3. Webhook の利用をオンにする
4. LINE 公式アカウント（ボット）を対象のグループに招待する
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

- コミュニケーションプラン（月額無料）は月 **200 通**まで無料
- メッセージ通数は「送信リクエスト数 × 送信対象の人数」でカウント（1 リクエスト内の吹き出し数は無関係）
- 例: 10 人のグループに 1 回送信 = 10 通としてカウント
- ブロック中のユーザーなど実際に届かない相手はカウントされない。応答メッセージ（reply）は無料

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
