# 実装計画（エネルギー）

- [ ] 境界値テスト用、prototype にゲーム全体のリセットボタンを用意（EN store 単体でなく全 store 対象。time-control-03 `ActionBar` の `resetAll` 相当）
  - (decision-records.md 2026-09-21)
- [ ] proto-03 へ EN 切れ時の action（見た目演出）を実装
  - proto-01 の `energyOutAction` 相当。proto-03 は EN 消費配線のみ済み、演出は未着手
- [ ] 経路計画時に EN 切れが見えない UX の妥当性を検討
  - (design.md 懸念・リスク)
- [ ] 回復アイテムの配置を検討
  - (design.md 懸念・リスク)
- [ ] actor（box-bot）へ EN 回復ロジックを実装（proto-01、回復アイテム/回復スポット、別 PR）
  - (decision-records.md 2026-09-16)
