# 決定事項（セルクリックの判定を find-path の listener へ集約する）

## 2026-10-16

- listener は `_events/_event-listeners/` でなく stage の `_hooks/` に置き `useStage` から呼ぶ。`FindPathEventListeners` の位置からは waypoint-flow store・handle を参照できないため（親 decision-records 2026-10-16 の「`_event-listeners/` 配下へ移す」から変更）
- story の隣接クリック移動は meta の decorator（`Stage07HandleProvider`・`Stage07EventProvider`・`MoveOnAdjacentCellClick`）と `render` に集約した。story 単位の `Stage07EventProvider` は外し、meta 側の 1 つに揃える（内側に別の EventTarget があると `MoveOnAdjacentCellClick` へクリックが届かないため）
