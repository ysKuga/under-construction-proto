# 実装計画（PR #305）

- [ ] 下準備（stage-07）: `GeoLayer` へ hover 通知 `onCellHover(cell | undefined)` を追加
  - Context 注入か props か決める（`CellTitleProvider` と同様に Context が候補）
  - (decision-records.md 2026-10-09)
- [ ] 本対応（proto-03）
  - hover 中マスの store
  - セル情報パネル component（スクロール対応）・stories
  - (decision-records.md 2026-10-09)
- [ ] 再レンダリング量を計測し、トリガー方式（ホバー継続 / クリック固定）を確定
  - (decision-records.md 2026-10-09)
- [ ] 不要になった `title` 表示（`useGetCellTitle`・`CellTitleProvider`）の扱いを決める
