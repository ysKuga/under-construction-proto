# 決定事項（proto-03 へ seed 入力・再生成を組み込む）

- 2026-10-11: #315 の backlog「組込み: proto-03 へ seed 入力・再生成を追加」に着手。PR #319 を先行作成した
- 2026-10-11: seed 未指定時の既定盤面は固定配置（`DEFAULT_STAGE_LAYOUT`）のままとした。既存 story・テストへ影響しないため
- 2026-10-11: `StageSeedProvider`（`_contexts/stage-seed`）が seed を `ResetProvider` の外で保持し、`StageLayoutProvider` を `key={seed}` で再マウントする構成で実装。生成時は霧・表示設定も既定へ戻る（リセットと同じ挙動）
- 2026-10-11: 操作パネルへ seed 入力・「生成」・「再生成」を追加、story `Generated`（initialSeed=1）を追加。Storybook で生成・再生成・リセット時の盤面保持を確認済み
