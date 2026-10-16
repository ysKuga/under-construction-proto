# Stage07 の handle context と隣接クリック移動 component を用意する

PR: #347（親: #137 backlog「セルクリックの判定を event 経由で find-path 側の listener へ集約する」、#346 の下準備）

## 目的

- `Stage07` から組込みのクリック移動を外した後も、`Stage07` 単体（story 等）で隣接クリック移動できるようにする
- 挙動は変えない。組込み移動の廃止と story への適用は #346 で行う

## 背景・制約

- #346 で `useHexMove.handleCellClick` を廃止すると、`Stage07` はクリックを `Stage07-cell-click` で発行するのみになる
  - story（Default 等）はクリックで移動できなくなる
- 移動は `Stage07Handle.moveTo`（#345）で命令できる
- handle の配布は proto-03 の `Stage07HandleProvider`（`_contexts/stage07-handle`）が持つ

## 方針

- `Stage07HandleProvider`・`useStage07HandleRef` を stage-07 の `_contexts/stage07-handle` へ昇格する
  - proto-03 は stage-07 側を import する
- stage-07 へ `MoveOnAdjacentCellClick` component を追加する
  - `Stage07-cell-click` を購読し、context の handle の `moveTo` を呼ぶ
  - 現在セル・非隣接・進入不可は `moveTo` が `false` を返すのみで何もしない
  - `null` を返す（listener のみ）
- 本 PR では `MoveOnAdjacentCellClick` をどこにも置かない
  - 組込みの `handleCellClick` と併存すると、同じクリックで移動が二重に走るため

## 懸念・リスク

- なし
