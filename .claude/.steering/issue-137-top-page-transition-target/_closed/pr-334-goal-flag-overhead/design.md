# ゴールの旗を bot 頭上へ移動する演出

PR: #334（親: #137 backlog「ゴール到達時の演出を検討する」）

## 目的

- find-path proto-03 でゴール到達時、旗が bot に重なって表示される状態を解消する
- 到達を旗の上昇演出で示す

## 背景・制約

- #333 で到達後は終了状態（`Stage07` 非対話化・移動関連表示の抑止）になった
- 旗は proto-03 `_layers/goal-marker-layer` が床上へ描画している
- bot 頭上の表示は actors store の `overlayContainers[PLAYER_ACTOR_ID]` へ `createPortal` する（吹き出しと同じ経路）

## 方針

- bot がゴールセルの中心へ着いた時点で、床上の旗を非表示にする
- `overlayContainers[PLAYER_ACTOR_ID]` へ旗を表示する
- 表示時に bot 位置から頭上へ上昇する animate を付ける
- リセットで床上の旗へ戻す
- 到達後は吹き出しを全て隠す

## 懸念・リスク

なし
