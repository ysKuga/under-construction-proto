# 実装計画（GeoLayer のセル hover 通知）

- [ ] 注入方式を決める（Context か props か）
  - (decision-records.md 2026-10-09)
- [ ] `GeoLayer` の interactive セルへ `onPointerEnter`/`onPointerLeave` を付与し `onCellHover(cell | undefined)` を呼ぶ
- [ ] テスト・stage-07 stories で hover 通知を確認
