# チェックポイント（開始位置）へのリセット

issue: #289（親: #281）

## 目的

find-path proto-03 の EN 切れ時の救済として、代価を払って actor をチェックポイント（開始位置）へ戻せるようにする。

## 背景・制約

- 親: [issue-281 backlog.md](../../backlog.md)「チェックポイント（開始位置）へのリセット」からの分割
  - stage-07 の準備と proto-03 の実装で複数 PR にわたるため分離した
  - EN 切れ bubble への提示は親側で扱う
- 対象は proto-03
- 代価は案A（[decision-records.md](decision-records.md)）

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- 既存のリセットは使えない
  - `ResetProvider`（proto-03 `_contexts/reset`）は配下を再マウントし、全 store を初期化する
- `moveActor` での位置変更は見た目が破綻する
  - actor の移動は CSS transition（`actors-layer`）のため、開始位置まで滑って戻る
  - 途中で `useEffectCellReach` が通過マスの到達イベントを発行する
- EN を store の `reset()` で戻すと EN 切れ演出が残る
  - `reset()` は `Energy-recovered` を発行しないため、`energyOut` の切替が起きない
