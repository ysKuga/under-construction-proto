# event駆動 action 実装順序

action(イベント経由で発火する処理)実装時、以下の順で進める。

1. event定義: `ACTION_XXX` 定数・発火/購読の配線のみ実装。state(boolean等)の切替のみ、見た目の変化なし
2. 挙動検討: state を受けてどう動かすか、既存 action との組合せ方を洗い出す
3. 挙動実装: 検討結果を実装

## 理由

state定義(event発火経路)と見た目の挙動を分離すると、event設計(命名・toggle/start-stopの選択・context化の要否)を挙動実装の複雑さに引っ張られず先に固められる。box-bot の walking action実装で採った手順。
