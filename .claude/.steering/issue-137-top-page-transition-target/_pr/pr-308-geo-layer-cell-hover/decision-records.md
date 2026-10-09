# 決定事項（GeoLayer のセル hover 通知）

## 2026-10-09

- 通知シグネチャ: `onCellHover(cell | undefined)`。`undefined` は hover 解除
- 注入方式は `CellTitleProvider` と同様の Context が候補（props だと memo を崩しやすい）
- 注入方式: Context（`_contexts/cell-hover`、`CellHoverProvider`/`useHandleCellHover`）。value は memo 化
- 解除通知は layer（コンテナ）の `pointerleave` のみ。セル単位の leave では通知しない（セル間移動で2回通知を避ける）
