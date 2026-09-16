# proto-03（hex）への障害物セル適用

issue: #137

## 目的

find-path proto-03（hex グリッド、隣接クリック逐次移動）に障害物セルを追加する。

## 背景・制約

- proto-01（矩形グリッド、tick 駆動）向けの障害物実装は PR #176 で完了済み（[20260916-obstacles/design.md](../20260916-obstacles/design.md)）。座標系（矩形 `col`/`row` vs hex axial `q`/`r`）と移動方式（tick 消化 vs 隣接クリック逐次移動）が異なるため、既存の `OBSTACLE_CELLS`/`isObstacleCell` はそのまま流用できず作り直しが要る
- proto-03 の構成（`_prototypes/CLAUDE.md`）: `Stage07`/`useHexMove` に隣接判定・移動が内蔵済み。`GeoLayer`（対話）・`MoveTargetLayer`（選択可能マス演出）・`goal-marker-layer` が既存
- 着手タイミング: PR #176（proto-01 障害物実装）マージ後

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

(なし)
