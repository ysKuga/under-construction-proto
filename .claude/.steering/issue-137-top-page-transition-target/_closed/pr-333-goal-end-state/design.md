# ゴール到達後の終了状態

PR: #332（親: #137 backlog「ゴール到達時の演出を検討する」）

## 目的

- find-path proto-03 でゴール到達後をゲーム終了状態とし、リセットまで操作を受け付けない
- 後続の旗の頭上移動演出（別 PR）の前提を作る

## 背景・制約

- 到達判定: `use-handle-cell-change.ts` で初回到達時に `goalStore.reach()`・履歴へ `reach-goal` を記録
- 到達の表示は操作パネルの「🎉 ゴール到達」と、セル情報パネルの「到達済み」のみ
- 到達後も移動・目標設定・移動可能マス表示が通常どおり続く

## 方針

- `Stage07` を非対話化する（`interactive` へ `!goalReached` を追加）
- 移動関連の表示を抑止する
  - 移動可能マス（`MoveTargetLayer`）
  - 経路プレビュー・目標マーカー・吹き出し（waypoint-flow を `clear()`）
- 到達時点で自動移動（follow-path）を打ち切る
- リセット（`_contexts/reset`）で `goalStore` も初期化し、通常状態へ戻す

## 懸念・リスク

- 到達判定は `onCellChange`（セル進入時）。bot がセル中心へ着く前に終了状態へ入る可能性
  - `useAdvanceFollowPathOnCellReach` 同様、中心到達のイベントを待つか要確認
- `goalReached` の購読先を増やす際、memo 化済みレイヤー（EN 等で再レンダリングしない方針）を巻き込まない
