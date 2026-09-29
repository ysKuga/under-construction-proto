# 実装計画（EN 切れ時の救済手段）

- [x] 手持ち（携行）アイテム（#283）
  - proto-03 のアイテムは踏むと即時回復するため、携行の仕組みを作る
    - proto-01 の `carried-items` store（`pickUp`/`useItem`/`capacity`）を流用候補とする
    - 対象: `use-handle-cell-change` の即時回復を携行へ切り替える
  - 手持ちの表示と使用
- [x] チェックポイント（開始位置）へのリセット（#294）
  - サブ issue #289 へ分離（[_closed/issue-289-checkpoint-reset](_closed/issue-289-checkpoint-reset/backlog.md)）
- [x] EN 切れ bubble へ救済手段を提示する（#296）
  - 親 #137 の bubble 本体（#295）の上に実装した（[_pr/pr-296-energy-depleted-rescue](_pr/pr-296-energy-depleted-rescue/design.md)）
  - 手持ちがあれば使用、なければチェックポイントへのリセット
- [ ] スポットマスでの停止中使用（検討）
  - 現状のスポットは踏むと即時回復
  - 難易度に応じて提示を絞る（いじわるな難易度では提示しない）
  - #297 へ切り出し、#281 は close
