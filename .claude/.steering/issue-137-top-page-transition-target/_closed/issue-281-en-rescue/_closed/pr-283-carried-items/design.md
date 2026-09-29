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
  - `pickUp`/`capacity`/`reset` の構成は同じ。取り出しは最古からでなく id 指定（`removeItem`）
  - 上限は `CARRIED_ITEM_CAPACITY`（`_stores/carried-items/constants.ts`、proto-01 と同じ 3）。`CarriedItemStoreProvider` の `capacity` 省略時の既定値
- 拾う処理は `handleCellChange` で行う
  - 回復アイテム（`stock` 未指定）: 携行する。上限に達していればその場に残す
  - 回復スポット（`stock` 指定）: 従来通り即時回復
- 使用は汎用のアイテム使用イベントで扱う（ui-jurisdiction）
  - UI は `FindPath-use-item`（`itemId` + 使用方法 `usage`）を発行するのみ
  - `use-item-use-event-listener` が受理判定・携行からの除去を行い、`FindPath-item-used` を通知する
    - 携行していない・許可されていない使用方法なら `preventDefault()` で拒否する
  - 効果は用途ごとの listener が `FindPath-item-used` を購読して処理する（`recover-energy` は `use-recover-energy-item-effect-event-listener`）
  - 使用方法の許可はアイテム種別ごとのホワイトリスト（`_lib/item-usage.ts`）。先頭が UI の提示する代表用途
- 使用 UI は状態表示（独立 bot）の左下に重ねるショートカット群（`shortcuts`）に置く
  - アイテムの種類（`ITEM_KINDS`）ごとに使用ボタン（`carried-item-button`）を並べる
  - 丸で囲ったアイテムを表示し、その種類の携行数を右下へ重ねる（丸からのはみ出しは許容）
  - クリックでその種類の最古の携行アイテムを代表用途で使用する（携行数 0 なら disabled）

## 決定事項

- 携行 store は proto-01 と共通化せず proto-03 固有に移植する
  - 座標系が異なり、`_stores/items` も同様に移植している
- `CarriedItemStoreProvider` は `FindPathEventProvider` の外側に置く
  - 使用の listener が携行 store を参照するため
- 使用 UI は当初操作パネルへ置いたが、状態表示の bot の左下へ移し操作パネルからは削除した（レビュー指摘）
- 使用ボタンは種類ごとに分ける（他の種類のアイテム追加時に混ざらないよう）
- 状態表示に重ねる置き場はショートカット群（`Shortcuts`）とし、同様の要素を今後ここへ追加する
- 使用の受理と効果を listener で分ける経緯は [decision-records.md](../../decision-records.md) 参照

## 実装計画

- [x] 携行 store（`_stores/carried-items`）とテスト
- [x] アイテム使用イベント（`FindPath-use-item`/`FindPath-item-used`）と listener
- [x] `handleCellChange` の即時回復を携行へ切り替える
- [x] 状態表示の bot の左下（ショートカット群）に種類ごとの使用ボタンを追加する
- [x] アイテムの hover 説明文言・関連コメント・`_prototypes/CLAUDE.md` を更新する
