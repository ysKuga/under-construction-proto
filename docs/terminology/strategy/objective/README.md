# docs/terminology/strategy/objective/

目標 (objective)

actor が今回の移動で向かうセル。\
find-path では、隣接していないセルをクリックして指定する（issue #226）。

## 関連する用語

- ゴール: ステージの最終到達点（`GOAL_POSITION`）。目標より上位の「目的」寄り
- 目標: 今回の移動で向かう地点
- 中継点: 目標までに経由する地点
- 経路: 目標まで実際に通るセルの並び

## 命名

- コード上の識別子は `objective` を使う
- `target` は使わない
  - 既に `MoveTargetLayer`（隣接する移動可能マス）で使っているため
- 「目的地」は使わない
  - 「目的」は最終的・全体的なニュアンスを持つため（[strategy](../README.md) 参照）
