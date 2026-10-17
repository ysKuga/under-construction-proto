# 決定事項（stage-area から stage-group・bot-status-panel を切り出す）

- 2026-10-18（PR 単位）: 移動と切り出しを 1 つの PR にした
  - 理由: 移動先が切り出しで新しく作る component の配下になり、中間の状態を作れない
- 2026-10-18（確認）: 切り出し前後で expedition の全 story（5 件）のレイアウトが 1px 単位で一致した
