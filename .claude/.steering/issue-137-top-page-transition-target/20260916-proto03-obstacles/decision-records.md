# 決定事項（proto-03 障害物セル）

- 2026-09-16: proto-01 の障害物実装（PR #176）を踏まえ、proto-03 向けを別 steering として起票。座標系・移動方式の違いにより実装は作り直しになる見込み。PR #176 マージ後に着手予定
- 2026-09-16: 実装方針確定
  - データ定義: `proto-03/constants.ts` に `OBSTACLE_CELLS: HexCell[]`（axial 座標）を追加。判定は `proto-03/_lib/obstacle.ts` の `isObstacleCell`（proto-01 と同名だが座標系が異なり共用不可）
  - 選択拒否: `useHexMove`（stage-07、汎用 hook）へ `canEnter?: (cell: HexCell) => boolean` 引数を追加し、隣接判定の直後で判定（「隣接候補から除外」に近い形）。`Stage07` に `canEnterCell` prop を新設しそのまま渡す。stage-07 は find-path 固有の「障害物」概念を持たず、汎用的な進入可否判定として持たせることでバージョン間依存ルール（stage-07 は find-path に依存不可）を維持
  - 視覚化: 新規 `ObstacleLayer`（非対話、`GeoLayer` と同じ `hex-layout` 座標計算を共有）。加えて `GeoLayer`/`MoveTargetLayer` の「選択可能」表示（`cursor: pointer`・点線枠）にも `canEnterCell` を反映し、押せそうに見えて実は拒否される、という見た目の矛盾を解消
