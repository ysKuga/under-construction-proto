# 障害物セル

issue: #137

## 目的

経路プランニング制のステージに障害物セルを追加し、パズル性（「挑戦」「工夫」）を持たせる。

## 背景・制約

- 親: [issue-137 backlog.md](../backlog.md) 該当項目からの分割（歩数制限・一方通行セルは別 steering）
- 衝突判定方針は確定済み: 次マスに障害物があれば `moveActor` 自体を呼ばない（decision-records.md 2026-09-16）
- 経路プランニング制は離散ステップ実行のため、マス移動途中の急停止は不可（現 actor 移動は CSS transition 任せで JS 側が途中位置を持たない）

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- `OBSTACLE_CELLS` は静的定数の直書き。ステージごとに配置を変える仕組み（複数ステージ対応）は未実装
- proto-02（隣接逐次移動）は対象外のため、隣接移動系で障害物が必要になった場合は別途対応が要る
