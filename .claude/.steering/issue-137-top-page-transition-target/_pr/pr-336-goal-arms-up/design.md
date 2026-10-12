# ゴール到達時に bot の両手を上げる

PR: #336（親: #137 backlog「ゴール状態で bot の両手を上げる挙動を検討する」）

## 目的

- find-path proto-03 でゴール到達を bot の両手上げで示す

## 背景・制約

- #334 で、bot がゴールセルの中心へ着いた時点に goal store の `flagRaised` が立つ
- box-bot の `armToggle` はトグル式。player bot での有効化は #335
- `energyOut`（EN 切れ演出）もトグル式で、腕の持ち上げ角を 0 に書く
- 状態表示 bot は `STANDALONE_BOT_RELAYED_ACTIONS` のイベントを中継して同期する

## 方針

- `flagRaised` が立った時点で `armToggle` を 1 回発火し、上げたまま止める
  - `flagRaised` は一度しか立たず、リセットで store ごと作り直されるため、トグル式のままで足りる
- 到達後は `energyOut` の発火を止める（切れ・復帰とも止め、トグルの偶奇を崩さない）
- 状態表示 bot へ `armToggle` を中継する

## 懸念・リスク

なし
