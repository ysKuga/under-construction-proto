# 決定事項（proto-03 のステージ上の bot と独立 bot を歩行中に上下させる）

- 2026-09-26: 独立 bot の中継対象（`STANDALONE_BOT_RELAYED_ACTIONS`）と受付 action（`STANDALONE_BOT_ACTIONS`）を分離する
  - PR #256 では両者を一致させていた（中継対象を `STANDALONE_BOT_ACTIONS` から導出）
  - `bodyBobbingAction` のイベントは `defineAction` の必須項目を満たすためのダミーで、中継は意味を持たないため
- 2026-09-26: ステージ上の bot の `bodyBobbing.swingRef` を `legSwingAngle` に連動させる
  - `swingRef` は脚振り角の正規化基準。既定 0.5 のままだと、スライダーで振り角を変えた際に上下が頭打ち、または最大量に届かなくなる
  - 独立 bot は walking の既定値（`swingAngle: 0.5`）で動くため連動不要
- 2026-09-26: ステージ上の bot の上下量は Stage07 のスライダー(`bodyBobHeight`、既定 0.1)で調整する
  - `BODY_BOBBING_DEFAULTS.height`(0.025)は Canvas 一辺 234px 基準で、56px の bot では 1px 未満になり視認できない
  - 既定 0.1 は 234px 時の見かけを 56px へ換算した値(0.025 × 234 / 56 ≒ 0.1)
  - 独立 bot(160px)は既定値のまま
