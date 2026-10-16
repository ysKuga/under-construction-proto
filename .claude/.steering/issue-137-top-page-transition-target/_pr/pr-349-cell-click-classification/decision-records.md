# 決定事項（セルクリックの pointer 判定を listener の分類へ揃える）

- 2026-10-16: 判定の出所の一本化に留め、新しい表示判定は加えない。到達不能セルの pointer 除外は全セル BFS になるため不採用（親 decision-records.md 2026-10-16 表示判定）
- 2026-10-16: pointer は `classifyCellClick` を直接呼ばず、現在マス判定 `isCellClickIgnored` を切り出して共有した。`classifyCellClick` は `canEnterCell`（EN 残量込み）を要し、pointer 側で呼ぶと EN 変化で `GeoLayer` が再レンダリングされるため
- 2026-10-16: 分類が `move` でも `moveTo` に拒否された場合は目標として扱う（従来の挙動と同じ）
