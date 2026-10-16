# セルクリックの pointer 判定を listener の分類へ揃える

PR: #349（親: #137 backlog「セルクリックの判定を event 経由で find-path 側の listener へ集約する」PR 4）

## 目的

- クリックの分類と pointer 表示を同じ元から判定し、判定の重複・ずれを防ぐ
- 汎用 UI の `Stage07` が find-path の分類を知らずに済む形を保つ

## 背景・制約

- #346 で分類を `useCellClickEventListener` へ集約済み。ただし手続きの中に埋まっている
- pointer は `Stage07` 内部の `isCellSelectable`（現在セル以外）
  - 現在の分類（現在マスのみ何もしない）と一致しており、ずれは現在マス判定の重複のみ
- `GeoLayer` は `isCellSelectable` の参照変化で再レンダリングされる（現状も移動ごと）
- 「現在 / 移動 / 目標再クリック」は同期判定できる。EN 拒否（`FindPath-propose-path`）・到達不能（BFS）は同期で判定できない、または重い

## 方針

- 純粋関数 `classifyCellClick` を切り出す
  - 入力: `cell`、`currentCell`・`flowState`・`objectiveCell`・`canEnterCell`
  - 返り値: `'current' | 'move' | 'cancel-objective' | 'objective'`
  - EN 拒否・到達不能は `'objective'` に含める
- listener は分類で分岐する
  - `'move'` は `Stage07Handle.moveTo` で実行する（戻り値は保険として残す）
- pointer の判定関数 `isCellSelectable` を stage-07 の `_lib/cell-selectable` へ置く
  - `Stage07`（`GeoLayer` の pointer）と `classifyCellClick`（`current` の判定）が共に import する
  - prop で受け渡さない（props drilling を避ける）
  - 依存は `currentCell` のみに留める（`flowState`・EN は含めない）
- disabled（「実行」吹き出し）は対象外

## 懸念・リスク

- 分類と `moveTo`（`useHexMove.tryMove`）で移動判定が二重になる（ずれた場合は目標として扱う）
