# 実装計画（ゴールの旗を bot 頭上へ移動する演出）

- [x] 到達時に床上の旗を非表示にする
  - registry が `visibility` を直書きするため `opacity` で消す
- [x] bot 頭上のオーバーレイへ旗を表示する
  - 注入先: `overlayContainers[PLAYER_ACTOR_ID]`
- [x] 表示時に bot 位置から頭上へ上昇する animate を付ける
  - 開始はゴールセルの中心到達（`Stage07-cell-reach`）時
  - (decision-records.md 2026-10-12)
- [x] 吹き出しとの重なりを確認する
  - 到達後は吹き出しを全て隠す
  - (decision-records.md 2026-10-12)
