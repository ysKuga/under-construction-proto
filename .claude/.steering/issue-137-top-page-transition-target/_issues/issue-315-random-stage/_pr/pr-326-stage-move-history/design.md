# find-path の手数履歴を記録・表示する

PR: #326（親: #315）

## 目的

find-path（proto-03）で使用した手数を、リセットをまたいで通算し確認できるようにする。

## 背景・制約

- 親 design: [../../design.md](../../design.md)「仕様」「基本構成案」
- 仕様（親 design「仕様」の履歴）
  - 手数はリセットをまたいで通算
  - リセット自体も履歴へ追加（検討）
  - 全件保持（上限 10000 件程度）
- リセットは `ResetProvider`（`_contexts/reset`）の `key` 再マウントで全 store を初期化する
  - 履歴は再マウント対象の外（`StageSeedProvider` と `ResetProvider` の間等）に置く
  - (../../_closed/pr-325-stage-reset/design.md)
- 履歴は高頻度に追記されるため、表示側のみ selector 購読で再レンダリング範囲を絞る（[docs/performance](../../../../../../../docs/performance/README.md)）

## 懸念・リスク

- 手数の単位が未確定（1マス移動ごと／経路実行 `FindPath-execute-path` 1回ごと）
- seed 変更（再生成）時に履歴を通算するか破棄するか未確定
