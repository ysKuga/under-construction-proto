# 決定事項（proto-03 でステージ横に独立 bot を並べて表示する）

- 2026-09-25: ステージ部分（`CellTitleProvider` + `Stage07`）と `BoxBot01` を横並びの flex コンテナで包む形で実装
  - 独立 bot は `actions={[]}`・`interactive={false}` の静止表示、向きを視認しやすいよう 160px（ステージ上は 56px）
