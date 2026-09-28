# 実装計画（チェックポイントへのリセット）

- [ ] stage-07: actor を移動アニメーションなしで指定セルへ移すワープ手段
  - 通過マスでマス到達イベント（`useEffectCellReach`）を発行しない
  - actors store に `warpActor` と actor ごとの移動種別を追加する
  - `ActorsLayer` は移動種別が `warp` のとき `left`/`top` の transition を 0ms にする
  - `Stage07Handle` に `warp(cell)` を追加する
    - `warpActor` を呼ぶ
    - 向きを `pickInitialFacingTarget` の規則で初期表示時と同じにする
  - (design.md 懸念・リスク、decision-records.md 2026-09-28 ワープ手段)
- [ ] proto-03: `FindPath-reset-to-checkpoint` イベントと listener
  - 受理条件: EN 切れ中かつ停止中
  - 位置: `Stage07Handle.warp` で `START_POSITION` へ
  - EN: `Energy-recover` イベントで初期値まで回復する
  - fog: `markVisited(START_POSITION)` で視界の基準を移す
  - 目標・中継点: `waypointFlow.clear()`
    - ワープより先に呼ぶ（ワープ先の到達イベントで自動移動が進まないようにする）
  - 確認用に control-panel へ仮ボタンを置く
  - (decision-records.md 2026-09-28)
