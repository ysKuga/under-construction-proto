# ステージ配置の StageLayout 化

PR: #316（親: #315）

## 目的

proto-03 の固定配置定数を `StageLayout` 型へまとめ、Context で配る。
ランダム生成（#315）で配置を差し替えられる状態にする。
挙動は変えない。

## 背景・制約

- 親 design: [../../design.md](../../design.md)「基本構成案」
- 対象定数（`constants.ts`）
  - `GOAL_POSITION`
  - `OBSTACLE_CELLS`
  - `ONE_WAY_CELLS`
  - `CHARGE_ITEM_CELLS`
  - `CHARGE_SPOT_CELLS`
  - `START_POSITION`
  - `PARTIAL_FOG_CELLS`（`GOAL_POSITION` 由来の派生値）
- 対象外: `GRID`・`HEX_SIZE`・`OBJECTIVE_OVERLAY_ID`・EN スポットの時間定数（盤面配置でないため）
- 参照元
  - layer 群（goal-marker / obstacle / one-way）
  - `_lib/obstacle.ts`・`_lib/one-way.ts`（モジュールレベル関数が定数を直接参照）
  - `_stores/fog/context.tsx`
  - `index.providers.tsx`（`INITIAL_ITEMS` 組立て）
  - stage 配下の hook 群（cell-change・reset-to-checkpoint・cell-info-panel 等）
- 現状の固定値は `DEFAULT_STAGE_LAYOUT` として残し、Provider の既定値にする

## 基本構成案

- `StageLayout` 型と `DEFAULT_STAGE_LAYOUT` を定義する
- `StageLayoutProvider`（`_contexts/stage-layout`）で配り、`useStageLayout()` で読む
  - 配置はマウント中不変のため、store でなく Context の値で足りる
  - 差し替えは親 #315 方針どおり Provider の `key` 再マウントで行う
- `_lib` の判定関数は layout を引数で受ける形へ変える
- 派生値（霧セル・初期アイテム）は layout から組み立てる関数にする

## 懸念・リスク

- `_lib` 関数の呼出元が多い場合、引数追加の波及が広い
- テストが定数を直接 import している箇所は `DEFAULT_STAGE_LAYOUT` 経由へ置換が要る
