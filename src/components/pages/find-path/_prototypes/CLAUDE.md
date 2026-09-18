# _prototypes/

find-path ページの試作置き場 (issue #137)。route (`/find-path`) / page 実装は未着手。

試作の優先対象は proto-03（hex グリッド版、issue #162）。矩形グリッド版（stage-06、proto-01/02）より最終的なゲームデザインに近いため。新規機能はまず proto-03 へ実装する。

## 構成

- `_stores/energy`: proto-01/02/03 共有の EnergyStore（issue #181）。`createStoreContext` パターン。find-path ページ自体は route/page 未実装のため、`_prototypes` の外（page 直下）へはまだ出さない（PR-B 2026-09-17、issue-181-en decision-records.md 参照）
- `proto-01`: 試作。`prototypes/stage/stage-06` (遠近ステージ + actor 位置 ref 版) をページ枠へマウントした土台。ゲーム内容は経路プランニング制 (`planned-path` へ積み上げ → まとめて「実行」で tick 進行)
  - `_contexts/find-path-stores/`: time-control-03 の game-clock / path / planned-path を無改変で束ねる Provider。position / intent は持ち込まない (セル単位・単一 bot と噛み合わないため)。tick は未接続 (PR-C)
  - `_hooks/use-planned-path-steps.ts`: 予定経路をセル単位で append / pop する wrapper hook。tc-03 の planned-path store は無改変
  - `constants.ts` の `GOAL_POSITION`: 到達判定に使うゴールセル。`OBSTACLE_CELLS`: 通行不可の障害物セル一覧（proto-01 のみ対象、proto-02/03 は対象外）
  - `_lib/obstacle.ts`: `isObstacleCell` で cell が障害物か判定する。`PlannedPathLayer`（選択拒否）と `use-find-path-tick`（実行時、次マス障害物なら `moveActor` を呼ばない）双方から参照
  - `constants.ts` の `ONE_WAY_CELLS`: 一方通行セル一覧（座標 + `exitDirection`、壁型 ― `exitDirection` の反対側の辺に壁がある）。proto-01 のみ対象
  - `_lib/one-way.ts`: `isBlockedByOneWay(from, to)` で from-to 間に壁があるか判定する（壁のある辺を跨ぐ移動は方向を問わず不可）。`PlannedPathLayer` の選択拒否から参照（issue #137 決定事項）。`OPPOSITE_DIRECTION` はバリア線の辺計算のため `_components/one-way-layer` からも参照
  - `_components/one-way-layer/`: `ONE_WAY_CELLS` セルへ進入禁止方向（`exitDirection` の反対側）の辺だけ赤いバリア線を表示する非対話レイヤー（`ObstacleLayer` 同型）。矢印（退出方向を指す表示）は「その方向にしか行けない」ように見え実際の判定と食い違うため不採用（issue #137 決定事項）
  - `_components/goal-marker-layer/`: `GOAL_POSITION` セルに旗マーカーを表示する非対話レイヤー
  - `_components/obstacle-layer/`: `OBSTACLE_CELLS` セルを塗りつぶす非対話レイヤー。選択拒否自体は `PlannedPathLayer` 側の判定で行う
- `proto-02`: 試作。proto-01 とは別方式のゲーム内容比較用。隣接セルをクリックするたびに 1 手ずつ即時移動する逐次型 (`planned-path` 積み上げ・tick ループなし)
  - `_hooks/use-adjacent-move.ts`: `currentCell`(state) を軸に隣接判定 → (確認チェックボックス ON なら確認ダイアログ) → `moveActor`(DOM 直書き) を都度実行。「戻る」(直前セルへの逆戻り) も隣接クリックとして自然に許容され、proto-01 の重複選択問題が発生しない
  - `_components/adjacent-move-layer/`: 隣接セルのみ点線枠で選択可能を明示するクリックレイヤー
  - `GOAL_POSITION` は proto-01 の `constants.ts` を import して共用。`START_POSITION` は proto-02 固有
- `proto-03`: 試作。`prototypes/stage/stage-07`（hex グリッド版、issue #162）をページ枠へマウントした版。移動方式は proto-02 と同じ隣接クリック逐次移動だが、`Stage07` の `useHexMove` に内蔵済みのためページ側は `onCellChange` を受けるだけ
  - `constants.ts`: `GOAL_POSITION`/`START_POSITION` を axial 座標(`HexCell`)で定義。proto-01/02 とは座標系が異なるため独自定義（共用不可）
  - `_components/goal-marker-layer/`: `GOAL_POSITION` セルへ旗マーカーを表示する非対話レイヤー。`Stage07` の `hex-layout` を共有し座標をズレさせない
  - `_components/move-target-layer/`: 移動可能マス（現在地の隣接6方向）の表示演出レイヤー。現在地セル変更のたび非表示 → 80ms後に演出開始、を `useMoveTargetLayer` が管理する。表示完了後は次の bot 移動完了まで維持し、移動完了時点で非表示（初期表示と同一の見た目）に戻る。演出は `mode` prop（`MoveTargetDisplayMode`）で切替可能: `scatter`（bot マスへ集合 → 対象マスへ散開、既定）/ `instant`（transitionなしで対象マスへ即座に出現）/ `fade`（対象マスの位置で opacity 0→1、位置移動なし）
  - `_contexts/visibility-registry/`: proto-02 の `VisibilityRegistryProvider`（矩形グリッド・8近傍）を axial 座標・6近傍（`HEX_DIRECTIONS`）へ移植した hex 版。未到達マスを非表示にする。`Stage07` へ `registerCellVisibilityNode` prop を追加し、hex タイル DOM を registry へ登録できるようにした（`GeoLayer` が対話も兼ねるため `NodeKind` は `floor`/`marker` の2種のみ）。到達済み表示は `setShowVisited` で切替可能（既定 ON）
  - `constants.ts` の `OBSTACLE_CELLS`: 通行不可の障害物セル一覧（axial 座標。proto-01 と座標系が異なり共用不可）
  - `_lib/obstacle.ts`: `isObstacleCell` で cell が障害物か判定する
  - `_components/obstacle-layer/`: `OBSTACLE_CELLS` セルへ岩アイコンを表示する非対話レイヤー
  - `constants.ts` の `ONE_WAY_CELLS`: 一方通行セル一覧（axial 座標 + `exitDirection`、6方向。壁型 ― `exitDirection` の反対側の辺に壁がある）。proto-01 とは方向の型が異なり共用不可
  - `_lib/one-way.ts`: `isBlockedByOneWay(from, to)` で from-to 間に壁があるか判定する（壁のある辺を跨ぐ移動は方向を問わず不可）。`OPPOSITE_DIRECTION` はバリア線の辺計算のため `_components/one-way-layer` からも参照
  - `_components/one-way-layer/`: `ONE_WAY_CELLS` セルへ進入禁止方向（`exitDirection` の反対側）の辺だけバリア線を表示する非対話レイヤー。hex は6方向のため `HEX_VERTEX_ANGLES_DEG` 基準で進入禁止方向に対応する頂点ペアを求め SVG line で描画する（proto-01 は矩形なので border で足りるが hex は辺が斜めのため SVG が必要）
  - 選択拒否は `Stage07` の `canEnterCell` prop（`useHexMove` の隣接判定に組込み済み）で行う。`index.tsx` の `canEnterCell` が `isObstacleCell`/`isBlockedByOneWay`(直前セルは `currentCell` state)/EN 残量(下記)をまとめて `Stage07`/`MoveTargetLayer` 双方へ渡す。`MoveTargetLayer`（移動可能マス表示）もこの `canEnterCell` を参照するため、壁の先はガイド（移動可能マス表示）からも自動的に除外される。`GeoLayer`/`MoveTargetLayer` の選択可能表示（`cursor: pointer`・点線枠）にも同じ判定を反映し、進入不可セルは押せそうに見えないようにする
  - 確認ダイアログは対象外（別途検討）
  - EN（issue #181）: proto-01 と異なり予定経路・tick 駆動「実行」は導入しない（1 マスごとの隣接クリック移動のまま）。`EnergyStoreContext.Provider` を `index.tsx` の `FindPathProto03` 直下（`ActorNodeRegistryProvider` の外側）に配置し、`canEnterCell` へ残量判定を加え、`onCellChange`（`handleCellChange`）内で移動成立時に直接 1 消費する。PR-C(#188) で複数マス選択ごと実装したが選択済みセル表示がフェードアウトせず revert、再実装時にスコープを縮小した（`docs/concept/implementation/multi-cell-selection/README.md`）
