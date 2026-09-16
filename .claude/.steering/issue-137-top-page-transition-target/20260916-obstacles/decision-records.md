# 決定事項（障害物セル）

- 2026-09-16: 衝突判定は案 A（セル境界のみ）に確定。次マスに障害物があれば `moveActor` 自体を呼ばない方式。理由: 現 actor 移動は CSS transition 任せで JS 側がアニメ中の途中位置を持たないため、マス移動途中の急停止は不可（正確にやるなら Web Animations API 移行が要る、過剰と判断）。経路プランニング制は離散ステップのため案 A で十分（[issue-137 decision-records.md](../decision-records.md) 2026-09-16 より引継ぎ）
- 2026-09-16: 適用範囲は proto-01（tick 駆動）のみに確定。proto-02（隣接逐次移動）は比較試作のため対象外
- 2026-09-16: 障害物データは find-path ページ側（`proto-01/constants.ts` の `OBSTACLE_CELLS`）で保持し、`stage-06`/`actor-node-registry` へは持ち込まない方針で実装。stage-06 は汎用ステージ部品のため障害物概念を知らせない
- 2026-09-16: 実装完了。`_lib/obstacle.ts` の `isObstacleCell` を判定の一元化に用いる。`PlannedPathLayer` はクリック無視 + `disabled` + `cursor: not-allowed` で選択拒否、新設 `ObstacleLayer`（`GoalMarkerLayer` と同型の非対話オーバーレイ）で視覚化。`use-find-path-tick` の `applyNextStep` は次マス障害物時に `moveActor` とゴール判定のみスキップし、経路消化（`path` の pop・ログ・向き変更）自体は継続する
- 2026-09-16: `use-find-path-tick.test.ts` の既存 3 件失敗（fake timer 関連、変更前から発生）を確認。今回の変更に起因しないことを stash 比較で確認済み（別途原因調査が要る）
