# 決定事項（GeoLayer のセル hover 通知）

## 2026-10-09

- 通知シグネチャ: `onCellHover(cell | undefined)`。`undefined` は hover 解除
- 注入方式は `CellTitleProvider` と同様の Context が候補（props だと memo を崩しやすい）
