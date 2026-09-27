# 手持ち（携行）アイテム

issue: #281 / PR: #283（[backlog](../../backlog.md)「手持ち（携行）アイテム」）

## 目的

- proto-03 の回復アイテムを、踏んだ時点で即時回復せず携行できるようにする
- 携行中のアイテムを任意のタイミングで使用し、EN を回復できるようにする
- EN 切れ bubble から救済手段として提示する際の土台にする

## 背景・制約

- proto-03 のアイテムは現状 `handleCellChange`（`use-handle-cell-change.ts`）で一律に即時回復する
- proto-01 には携行の仕組み（`_stores/carried-items`）がある
  - `ItemInstance.cell` の座標系が proto-01（`GridPosition`）と proto-03（`HexCell`）で異なるため、そのまま共用できない

## 方針

- proto-01 の `carried-items` store を proto-03 へ移植する
  - `pickUp`/`useItem`/`capacity`/`reset` の構成は同じ
  - 上限は `CARRIED_ITEM_CAPACITY`（proto-03 `constants.ts`、proto-01 と同じ 3）
- 拾う処理は `handleCellChange` で行う
  - 回復アイテム（`stock` 未指定）: 携行する。上限に達していればその場に残す
  - 回復スポット（`stock` 指定）: 従来通り即時回復
- 使用は event 経由にする（ui-jurisdiction）
  - UI は `FindPath-use-carried-item` を発行するのみ
  - listener が携行 store から取り出し、`Energy-recover` を発行する
  - 携行が空なら `preventDefault()` で拒否する
- 表示と使用 UI は操作パネル（`ControlPanel`）へ置く
  - `携行: n/上限` の表示
  - 「使用」ボタン（携行数 0 なら disabled）

## 決定事項

- 携行 store は proto-01 と共通化せず proto-03 固有に移植する
  - 座標系が異なり、`_stores/items` も同様に移植している
- `CarriedItemStoreProvider` は `FindPathEventProvider` の外側に置く
  - 使用の listener が携行 store を参照するため

## 実装計画

- [ ] 携行 store（`_stores/carried-items`）とテスト
- [ ] `FindPath-use-carried-item` イベントと listener
- [ ] `handleCellChange` の即時回復を携行へ切り替える
- [ ] 操作パネルに携行数表示・「使用」ボタンを追加する
- [ ] アイテムの hover 説明文言・関連コメント・`_prototypes/CLAUDE.md` を更新する
