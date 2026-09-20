# 実装計画（エネルギー）

- [ ] EN 消費 → EN 切れ検知を event 経由の疎結合構成へリファクタ（`CONSUME_ENERGY`/`ENERGY_DEPLETED`、`_stores/energy/_event-hooks/` 新設）
  - (decision-records.md 2026-09-20)
- [ ] 回復アイテムの配置を検討
  - (design.md 懸念・リスク)
- [ ] 経路計画時に EN 切れが見えない UX の妥当性を検討
  - (design.md 懸念・リスク)
- [ ] アイテムを即時使用でなく携行可能とする方式を検討（取得/使用イベントの分離含む）
  - (design.md 懸念・リスク)