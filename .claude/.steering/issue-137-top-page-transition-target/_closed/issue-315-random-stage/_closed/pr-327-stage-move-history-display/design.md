# find-path の手数履歴を表示する

PR: #327（親: #315）

## 目的

find-path（proto-03）で記録した手数の履歴（PR #326）を画面上で確認できるようにする。

## 背景・制約

- 親 design: [../../design.md](../../design.md)「仕様」
- 記録は `_stores/move-history` が担う（[../pr-326-stage-move-history/design.md](../pr-326-stage-move-history/design.md)）
  - 履歴は古い順、`move`（1 手）と `reset`（手数に数えない）の 2 種類
  - 上限 10000 件
- 履歴は高頻度に追記されるため、表示側のみ selector 購読で再レンダリング範囲を絞る（[docs/performance](../../../../../../../docs/performance/README.md)）

## 仕様

- 手数（`move` の件数の通算）を表示する
- 履歴を新しい順に一覧表示する
  - 表示は直近の一定件数に限る（最大 10000 件の DOM 描画を避けるため）
  - `move`: 何手目か・移動元〜移動先のマス・マス数
  - `reset`: リセットした旨

## 懸念・リスク

- なし
