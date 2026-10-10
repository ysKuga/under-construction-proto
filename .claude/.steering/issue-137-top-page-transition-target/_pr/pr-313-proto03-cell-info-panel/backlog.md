# 実装計画（proto-03 のセル情報パネル）

- [ ] パネル component を `_contents/` へ追加し、`Stage07-cell-hover` を購読して内包要素一覧を表示する
- [ ] 再レンダリング量を計測し、トリガー方式（ホバー継続 / クリック固定）を確定する
- [ ] 不要になる `title` 表示（`useGetCellTitle`・`CellTitleProvider`）の扱いを決める
