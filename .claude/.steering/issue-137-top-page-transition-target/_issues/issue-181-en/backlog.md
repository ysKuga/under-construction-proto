# 実装計画（エネルギー）

- [ ] EN 消費 → EN 切れ検知を event 経由の疎結合構成へリファクタ（`CONSUME_ENERGY`/`ENERGY_DEPLETED`、`_stores/energy/_event-hooks/` 新設）
  - (decision-records.md 2026-09-20)
- [ ] 境界値テスト用、prototype にゲーム全体のリセットボタンを用意（EN store 単体でなく全 store 対象。time-control-03 `ActionBar` の `resetAll` 相当）
  - (decision-records.md 2026-09-21)
- [ ] 回復アイテムの配置を検討
  - (design.md 懸念・リスク)
- [ ] 経路計画時に EN 切れが見えない UX の妥当性を検討
  - (design.md 懸念・リスク)
- [ ] actor（box-bot）へ EN 回復ロジックを実装（proto-01、回復アイテム/回復スポット、別 PR）
  - (decision-records.md 2026-09-16)
