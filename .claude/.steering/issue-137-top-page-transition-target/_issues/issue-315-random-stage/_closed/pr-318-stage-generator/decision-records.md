# 決定事項（seed 付きステージ生成）

- 2026-10-11: #315 の backlog「生成: seed 付き乱数と `generateStage`」に着手。PR #318 を先行作成した
- 2026-10-11: 到達性の検証は障害物・一方通行のみとし、EN 込みは #315 の別項目へ切り出した（状態空間探索が重いため）
- 2026-10-11: `createRandom`（mulberry32）・`generateStage` を実装。試行上限超過時は `undefined` を返す
