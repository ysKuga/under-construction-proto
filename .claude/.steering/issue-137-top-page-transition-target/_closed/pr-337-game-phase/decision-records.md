# 決定事項（ゲームフェーズの導入）

## 2026-10-13

- ゴール判定（セル進入時）と演出開始（中心到着時）のずれを表すため、`clearing` を独立したフェーズにする
- `player-activity` の統合は後回し（player 単位の一時状態とゲーム全体のフェーズで軸が異なる）
- PR は「フェーズと許可の表の導入（本 PR）」と「ゴール演出のまとめ」に分ける
- 検討段階の steering は挟まず、本 PR から着手する（着手確定済みのため）
- 許可の項目: `enterCell`・`operateStage`・`performEnergyOut`・`showBubbles`・`warnEnergyShortage`。判定は store の `allows` に集約し、別 hook は設けない
- 「到達済み」の表示は許可でなく状態のため、`phase !== 'playing'` を直接読む
