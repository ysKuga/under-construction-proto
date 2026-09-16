# 一方通行セル

issue: #137

## 目的

経路プランニング制のステージに一方通行セルを追加し、パズル性（「挑戦」「工夫」）を持たせる。

## 背景・制約

- 親: [issue-137 backlog.md](../backlog.md) 該当項目からの分割（障害物・歩数制限は別 steering）

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## セル仕様

- 意味論: 退出方向固定型(ベルトコンベア型)。セルは「出られる方向」を1つ持つ(decision-records.md 2026-09-16)
- 逆方向進入時: 選択拒否。予定経路作成時、直前セルからの進入方向がそのセルの退出方向と逆なら選択不可にする(decision-records.md 2026-09-16)
- 実装対象: proto-01(矩形grid)・proto-03(hex)双方に実装済み

## 懸念・リスク

（なし）
