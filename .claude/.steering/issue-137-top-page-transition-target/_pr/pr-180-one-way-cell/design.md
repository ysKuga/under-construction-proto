# 一方通行セル

issue: #137

## 目的

経路プランニング制のステージに一方通行セルを追加し、パズル性（「挑戦」「工夫」）を持たせる。

## 背景・制約

- 親: [issue-137 backlog.md](../backlog.md) 該当項目からの分割（障害物・歩数制限は別 steering）

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## セル仕様

- 意味論: 壁型。セルは「開いている方向(exitDirection)」を1つ持ち、その反対側の辺には壁がある。壁のある辺を跨ぐ移動は方向を問わず常に不可(双方向とも通行不可、decision-records.md 2026-09-16)
- 選択拒否・ガイド抑制: 予定経路作成時の選択（proto-01 `PlannedPathLayer`）・移動可能マス表示（proto-03 `MoveTargetLayer`）とも、壁を跨ぐ先は disabled / 表示除外にする(decision-records.md 2026-09-16)
- 実装対象: proto-01(矩形grid)・proto-03(hex)双方に実装済み

## 懸念・リスク

（なし）
