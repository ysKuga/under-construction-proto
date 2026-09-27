# EN 切れ時の救済手段（手持ち・チェックポイント）

issue: #281（親: #137）

## 目的

find-path の EN 切れ時に、代価を払って EN 切れを脱する救済手段を用意し、EN 切れ bubble から選べるようにする。

## 背景・制約

- 親: [issue-137 backlog.md](../../backlog.md)「EN 切れ時に bubble で救済手段を表示する」からの分割
  - bubble 本体（状態表示・拒否時に揺らす挙動）は親側で扱う
  - 救済手段は複数 PR にわたるため分離した
- 構想: [docs/concept/ideas](../../../../../docs/concept/ideas/README.md)「EN 切れ時の救済手段」
- 対象は proto-03
- 救済は代価を要する

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- チェックポイントへのリセットに既存のリセットを使えない
  - 既存の `ResetProvider`（proto-03 `_contexts/reset`）は配下を再マウントし、全 store を初期化する
  - actor の位置だけを開始位置へ戻す手段が stage-07 側にあるか未確認
- 代価の定義が未決定
  - 戻す EN 量
  - 消費済アイテム・fog を保持するか
