# direction-followups

## 目的

`.claude/.steering/20260812-time-control-02-backlog/design.md` の実装計画1 (Direction 概念・命名の検討) のうち未完了の2項目を切り出したもの。

1. 視界 (Field of View) の距離上限 (見える範囲) の具体値を決定
2. `docs/concept/ideas/action-phase.md` の `MoveIntent`/`target` との関係 (target 座標から算出 vs 明示的に dispatch する)

まだ実装しない。方針・候補の洗い出しと決定事項の記録が目的。

## 背景・制約

- 用語・角度表現・Heading/Facing の内部表現・Position 間の極座標算出・視界の角度判定は決定済み。詳細は `.claude/.steering/20260812-time-control-02-backlog/design.md` の「決定事項」節を参照 (このファイルからの分割元)。
- 視界判定の角度部分は実装方針決定済み (`isWithinFieldOfView`、Facing 基準左右60度)。距離上限のみ未確定。
- `docs/concept/ideas/action-phase.md` に 企図(Intent)→予備→実行→成否→事後(Resolution) の5段階モデルと `MoveIntent` が定義済み (未実装、概念のみ)。
- `src/prototypes/time-control/time-control-02/` (issue #50) の Intent/Execution 分離システム (positionById/movePathById 等) は実装済み。詳細は `.claude/.steering/20260727-time-control-02-next-steps/design.md` の「実装済み: Intent/Execution 分離システム」節を参照。
- 座標は自由 `{ x, y }`、初期値 `{ x: 0, y: 0 }`、クランプなし。経路探索・境界処理はスコープ外。

## 実装計画

- [ ] 視界の距離上限 (見える範囲) の具体値を決定
- [ ] action-phase.md の `MoveIntent`/`target` との関係 (target 座標から算出 vs 明示的に dispatch する)

## 決定事項

<!-- 検討・決定した内容のログ -->

## 懸念・リスク

- Direction を独立状態として持つ場合、`dispatchMoveIntent` の度に Direction も更新する必要が生じ、store の責務境界 (position 管理 vs 向き管理) が曖昧にならないよう注意 (分割元 design.md より継承)。
