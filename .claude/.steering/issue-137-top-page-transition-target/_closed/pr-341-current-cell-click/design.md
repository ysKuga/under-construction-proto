# 現在マスのクリックで目標設定されないようにする

PR: #341（親: #137 backlog「bot の現在マスをクリックすると目標設定（経路提示）が表示される」）

## 目的

- find-path proto-03 で bot の現在マスをクリックしても、目標設定（経路提示）を表示しない
- 現在マスに `cursor: pointer` を付けない

## 背景・制約

- `Stage07` の `useHexMove.handleCellClick` は、隣接でないクリックを全て `onNonAdjacentClick` へ流す
  - `isHexAdjacent(現在マス, 現在マス)` は false のため、現在マスも非隣接として扱われる
- `GeoLayer` は `canEnterCell` が true のセルへ `cursor: pointer` を付ける
  - 現在マスは障害物・一方通行の判定に掛からず、pointer が付く
- 後続 PR が本ブランチへ積み重なる
  - `137-indirect-cell-click`: 通れない隣接マスのクリックを目標設定にする
  - `137-indirect-cell-pointer`: 目標設定になるマスへ pointer を付け、挙動と揃える

## 方針

- `handleCellClick` で現在マスのクリックを無視する（移動でも目標でもない）
  - `Stage07` 側で扱う。現在マスのクリックは find-path 固有の概念に依らない
- `GeoLayer` で現在マスへ pointer を付けない

## 懸念・リスク

- 現在マスのクリックへ将来別の意味（キャンセル等）を持たせる場合、`Stage07` 側の無視を見直す必要がある
