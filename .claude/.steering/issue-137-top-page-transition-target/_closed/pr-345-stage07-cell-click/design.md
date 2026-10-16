# Stage07 にセルクリック event と moveTo を追加する

PR: #345（親: #137 backlog「セルクリックの判定を event 経由で find-path 側の listener へ集約する」PR 1）

## 目的

- セルクリックの判定を find-path 側の listener へ移すための下準備をする
  - クリックを event で外部へ通知する
  - 隣接移動を外部から命令できるようにする
- 挙動は変えない（event-driven-actions の手順 1）

## 背景・制約

- 現状、クリックの分類（現在 / 移動可 / 不可）は `useHexMove.handleCellClick`（Stage07 内部）が持つ
  - find-path は `onIndirectClick` で「不可」の残りのみ受け取る
- hover は `Stage07-cell-hover` で既に event 化済み（PR #308）
- 移動の imperative API は `Stage07Handle` に `followPath`・`warp` がある
- `Stage07` の利用は proto-03 のみ

## 方針

- `Stage07EventMap` へ `Stage07-cell-click`（payload: `cell`）を追加する
  - `GeoLayer` のクリックで発行する（`Stage07-cell-hover` と同じく `GeoLayer` 内で dispatch）
  - 非対話（`interactive=false`）のセルでは発行しない
  - 本 PR では既存の `onCellClick`（`handleCellClick`）も残し、両方を実行する
- `Stage07Handle` へ `moveTo(cell): boolean` を追加する
  - `useHexMove.tryMove` をそのまま公開する（隣接判定・進入可否・facing・`onCellChange` を含む）
- `onIndirectClick`・`handleCellClick` の廃止は PR 2 で行う

## 懸念・リスク

- 本 PR の間は、クリック処理が `onCellClick` と event の 2 経路になる
  - event の購読者はまだないため挙動は変わらない。PR 2 で `onCellClick` 側を廃止する
