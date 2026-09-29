# EN 切れ bubble 本体

issue: #137 / PR: #295（backlog「EN 切れ時に bubble で救済手段を表示する」）

## 目的

- EN 切れ時、bot 頭上の bubble で動けない理由（EN 切れ）を伝える
- EN 切れ中の非隣接クリック（`FindPath-propose-path` の拒否）時に bubble を揺らす

## 背景・制約

- 救済手段（手持ち・チェックポイント）の bubble への提示はサブ issue #281 で扱う
  - 本 PR の bubble をそのまま救済手段の入口へ拡張する（1 bubble に手段 1 つ）
- EN 切れ時は目標設定（中継点フロー）がキャンセルされる（`useClearWaypointFlowOnEnergyDepleted`）
  - 中継点・実行の bubble（`BubblePair`）とは同時に表示されない
- UI は拒否の理由（EN）を扱わない（ui-jurisdiction）

決定事項: [decision-records.md](decision-records.md)

## 方針

- `_components/energy-depleted-bubble` を新設し、`BotBubble` に見た目・表示切替を委ねる
  - 表示位置は `WaypointBubble` と同じ bot 右上
  - 表示条件は player の EN が 0 以下
- `BotBubbleHandle` に `shake()` を追加する
  - 揺れは外側 div の `translate` プロパティで行う（左配置の `transform` と干渉させない）
- 揺らす行為をイベント `FindPath-shake-bot-bubble` として定義する
  - 非隣接クリックの提示が拒否された時、UI が発行する
  - 表示中の bot bubble が `allowMultiple` で購読して揺れる
- 注入先は `BotBubbles`（`_contents/bot-bubbles`）の bot 頭上オーバーレイ
