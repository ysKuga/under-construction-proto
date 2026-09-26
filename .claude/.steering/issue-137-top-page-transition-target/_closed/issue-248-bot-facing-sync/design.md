# ステージ上の bot の状態を同期する独立 bot 表示

issue: #248（親: #137）

## 目的

ステージ上で動作する bot とは別に bot を独立表示し、ステージ上の bot の状態（歩行・EN 切れ等）を同期して表示する。

## 背景・制約

- 親: [issue-137 backlog.md](../../backlog.md) の同名項目からの分割
- 当初は「向き」の同期を目的としていたが、各種状態の同期を主とし、向きは同期しない可能性もある（別途 UI を用意する等）
- 現状、ステージ上の bot に向き変更（spin 相当）はない（親 [design.md](../../design.md)「2. 操作キャラクター (bot)」）
- 対象は proto-03 を優先する

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- 独立 bot の脚振り周期がステージ上の bot とずれる可能性がある（検討事項、実際の見た目を確認してから判断）
  - ステージ上の bot の `cycleSec` は `moveDurationMs × 2`（`maxWalkCycleSec` で頭打ち）で算出され、`ActorsLayer` が `actionConfig` として渡している
  - `moveDurationMs`/`maxWalkCycleSec` は `Stage07` 内のスライダー state のため、独立 bot は既定の `WALKING_DEFAULTS` で動く
  - 対応候補: 見た目の同期として許容する / `cycleSec` 算出を store 等へ出し共有する
