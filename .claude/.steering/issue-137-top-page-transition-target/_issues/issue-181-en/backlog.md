# 実装計画（エネルギー）

- [ ] EN 消費 → EN 切れ検知を event 経由の疎結合構成へリファクタ（`CONSUME_ENERGY`/`ENERGY_DEPLETED`、`_stores/energy/_event-hooks/` 新設）
  - (decision-records.md 2026-09-20)
- [ ] 境界値テスト用、prototype に EN 残量調整 UI を用意
  - 手段
    - EN 残量調整 UI
    - リセットボタン
  - 対象: proto-03
  - issue-181-en 当 PR では対応不要
  - (decision-records.md 2026-09-20)
- [ ] 回復アイテムの配置を検討
  - (design.md 懸念・リスク)
- [ ] 経路計画時に EN 切れが見えない UX の妥当性を検討
  - (design.md 懸念・リスク)
- [ ] actor（box-bot）へ EN 回復ロジックを実装（proto-01、回復アイテム/回復スポット、別 PR）
  - (decision-records.md 2026-09-16)
