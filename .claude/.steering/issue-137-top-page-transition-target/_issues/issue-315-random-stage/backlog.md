# 実装計画（find-path ステージのランダム生成）

- [ ] 生成: seed 付き乱数と `generateStage`（純関数、到達性の検証付き）
  - [design](_pr/pr-318-stage-generator/design.md)
- [ ] 生成: EN 込みの到達性検証（アイテム・スポット込みの状態空間探索）
  - (_pr/pr-318-stage-generator/decision-records.md 2026-10-11)
- [ ] 組込み: proto-03 へ seed 入力・再生成を追加
- [ ] リセット時に盤面ごと初期状態へ戻す
- [ ] 履歴: 手数の記録と表示
  - 手数はリセットをまたいで通算
  - リセット自体も履歴へ追加（検討）
  - 全件保持（上限 10000 件程度）
