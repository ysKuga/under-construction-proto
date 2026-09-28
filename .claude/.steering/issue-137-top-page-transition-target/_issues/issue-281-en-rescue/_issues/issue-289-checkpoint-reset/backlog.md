# 実装計画（チェックポイントへのリセット）

- [ ] stage-07: actor を移動アニメーションなしで指定セルへ移すワープ手段
  - 通過マスでマス到達イベント（`useEffectCellReach`）を発行しない
  - (design.md 懸念・リスク)
- [ ] proto-03: `FindPath-reset-to-checkpoint` イベントと listener
  - 受理条件: EN 切れ中かつ停止中
  - 位置: ワープで `START_POSITION` へ
  - EN: `Energy-recover` イベントで初期値まで回復する
  - fog: `markVisited(START_POSITION)` で視界の基準を移す
  - 目標・中継点: `waypointFlow.clear()`
  - 確認用に control-panel へ仮ボタンを置く
  - (decision-records.md 2026-09-28)
