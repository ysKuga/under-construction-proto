# 実装計画（チェックポイントへのリセット）

- [ ] stage-07: actor を移動アニメーションなしで指定セルへ移すワープ手段
  - 既存の `moveActor` は CSS transition で滑って戻るため、障害物上を横切る
  - ワープ時はマス到達イベント（`useEffectCellReach`）を通過マスで発行しない
- [ ] proto-03: `FindPath-reset-to-checkpoint` イベントと listener
  - 受理条件: EN 切れ中かつ停止中
  - 位置: ワープで `START_POSITION` へ
  - EN: `Energy-recover` イベントで初期値まで回復する
    - `Energy-recovered` 経由で EN 切れ演出を解除するため
    - store の `reset()` はイベントを発行しない
  - fog: `markVisited(START_POSITION)` で視界の基準を移す
  - 目標・中継点: `waypointFlow.clear()`
  - 確認用に control-panel へ仮ボタンを置く
