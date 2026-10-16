# 決定事項（セルクリックの pointer 判定を listener の分類へ揃える）

- 2026-10-16: 判定の出所の一本化に留め、新しい表示判定は加えない。到達不能セルの pointer 除外は全セル BFS になるため不採用（親 decision-records.md 2026-10-16 表示判定）
- 2026-10-16: pointer は `classifyCellClick` を直接呼ばず、現在マス判定のみ共有する。`classifyCellClick` は `canEnterCell`（EN 残量込み）を要し、pointer 側で呼ぶと EN 変化で `GeoLayer` が再レンダリングされるため
- 2026-10-16: 当初の `Stage07` の `isCellSelectable` prop（proto-03 から `useStage` → `Stage` → `Stage07` と受け渡し）は props drilling のため廃止した。proto-03 の判定は `Stage07` の既定と同一で差し替えの必要がなく、stage-07 の `_lib/cell-selectable` の関数を find-path 側が import する向きで出所を揃えた。find-path 独自の pointer 判定が必要になった時点で context による注入を検討する
- 2026-10-16: 分類が `move` でも `moveTo` に拒否された場合は目標として扱う（従来の挙動と同じ）
- 2026-10-16: 分類から進入可否（`canEnterCell`）を外し、`move` は隣接マスのみで判定する。listener が同列の `useCanEnterCell` を import し購読も二重になっていたため（rules-reviewer 指摘）。進入可否は `moveTo` に任せ、拒否時は目標として扱う。目標になる隣接マスは進入不可のマスのみのため、目標再クリックを隣接判定より先に見ても挙動は変わらない
- 2026-10-16: 選択可能表示の判定は `GeoLayer` 配下の `useIsCellSelectable` へ移し、`GeoLayer` の `isCellSelectable` prop も廃止した。判定を使うのは `GeoLayer` のみで、`Stage07` は束縛した関数を受け渡すだけだったため
