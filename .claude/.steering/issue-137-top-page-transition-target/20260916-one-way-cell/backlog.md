# 実装計画（一方通行セル）

- [ ] `_lib/one-way.ts` 新設。`OneWayCell`(セル座標 + 退出方向)型と `isBlockedByOneWay(from, to)` 判定関数（proto-01 `_lib/obstacle.ts` 踏襲）
  - (design.md セル仕様 / decision-records.md 2026-09-16)
- [ ] `constants.ts` へ `ONE_WAY_CELLS` 定数追加
- [ ] `PlannedPathLayer` のセル選択 disabled 条件へ `isBlockedByOneWay` 追加（直前セル→対象セルの向き判定）
- [ ] 矢印の視覚表示コンポーネント新設（`ObstacleLayer` 同型の非対話 overlay 層）
  - (design.md 懸念・リスク: 3D 遠近ステージ上での表現方法)
- [ ] proto-03（hex）展開は障害物実装と同順で後続
