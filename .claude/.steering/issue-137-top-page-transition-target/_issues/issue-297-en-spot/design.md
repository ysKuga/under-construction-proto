# EN スポットの停止中使用と吹き出しの表示管理

issue: #297（親: #137）

## 目的

スポットマスを「踏むと即時回復」から「停止中に使用して回復する」形へ変え、EN 切れ bubble を含む吹き出しの表示管理を整える。

## 背景・制約

- #281 の残項目「スポットマスでの停止中使用（検討）」から切り出した（#281 は close）
  - [_closed/issue-281-en-rescue](../../_closed/issue-281-en-rescue/backlog.md)
- 構想: [docs/concept/ideas](../../../../../docs/concept/ideas/README.md)「EN 切れ時の救済手段」
- 対象は proto-03
- 現状のスポット
  - `_stores/items` の `ItemInstance.stock` 指定で表現する
  - `use-handle-cell-change` で踏むと即時回復する
- 現状の吹き出し
  - EN 切れ時は「実行」などを消し、救済手段（手持ちアイテム・チェックポイントへのリセット）を表示する（#296）
  - 親 backlog に「bubble の表示箇所をスロットとして定義し、表示対象を指定順に表示する」案がある

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- 時間経過の仕組み
  - 回復は移動と同様に完了まで時間を経過させ、中断は想定しない（decision-records.md 2026-09-30）
  - time-control の時間管理への統合は後回し。それまでの暫定的な時間経過の持ち方は未決定
- スポット提示の難易度
  - いじわるな難易度では提示しない方針（親 backlog）との兼ね合い
