# セルクリックの判定を find-path の listener へ集約する

PR: #346（親: #137 backlog「セルクリックの判定を event 経由で find-path 側の listener へ集約する」、base: #347）

## 目的

- クリックの分類（現在 / 移動可 / 不可）を UI（Stage07）から外し、find-path 側の listener 1 箇所へ集約する
- `onIndirectClick` による props drilling を解消する

## 背景・制約

- #345 で `Stage07-cell-click`・`Stage07Handle.moveTo` を追加済み
- #347 で handle context の stage-07 への昇格と `MoveOnAdjacentCellClick` を追加済み
- `FindPathEventListeners` は `Stage07EventProvider`・`WaypointFlowStoreProvider`・`Stage07HandleProvider` より外側にあり、そこからは購読できない

## 方針

- proto-03 に `useCellClickEventListener`（stage の `_hooks/`）を追加し、`useStage` から呼ぶ
  - `use-reset-to-checkpoint-event-listener` と同じ配置
  - 分類の順序は現状を維持する
    1. 現在マス: 何もしない
    2. `moveTo` で移動できた: 終了
    3. 経路提示中の目標の再クリック: 目標設定をキャンセル
    4. それ以外: 経路の提示（EN ガード・BFS・到達不能の通知）
  - `useHandleIndirectClick` の処理を移し、hook とテストを置き換える
- Stage07 から組込みのクリック処理を外す
  - `onIndirectClick` prop、`useHexMove` の `handleCellClick`・`onIndirectClick` 引数、`GeoLayer` の `onCellClick` prop を廃止する
- stage-07 の story は `Stage07HandleProvider`・`Stage07EventProvider`・`MoveOnAdjacentCellClick` で隣接クリック移動を補う

## 懸念・リスク

- なし
