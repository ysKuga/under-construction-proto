# GeoLayer のセル hover 通知

PR: #308（親: #137）

## 目的

- stage-07 `GeoLayer` のセル hover を呼び出し元へ通知できるようにする
- find-path proto-03 のセル情報パネル（マスホバー時の表示）の下準備

## 背景・制約

- 現状 hover 表示は `GeoLayer` セル `<button>` の `title` 属性のみ
  - 実体: proto-03 `useGetCellTitle`（`CellTitleProvider` 経由で注入）
- stage-07 に hover を外部へ通知する口がない（`onCellClick` のみ）
- stage-07 は find-path 固有の概念を持たない。通知はセル座標のみ渡す
- `GeoLayer` は `React.memo` 化済み。通知用コールバックで memo を崩さない
- 表示方針の検討経緯: [pr-305-cell-hover-display](../../_closed/pr-305-cell-hover-display/decision-records.md)

## 懸念・リスク

- 移動中（`interactive=false`）は `pointerEvents: none`、hover 通知不可
  - 3D ヒットテスト対策（issue #181 PR-C）。本 PR では対象外
