# 移動速度に応じてステージ上の bot の腕・脚の振りの回数を調整する

PR: #261（issue: #248）

## 目的

移動時間が短い（移動が速い）場合でも、速度に見合う回数だけ腕・脚を振らせ、不自然さを解消する。

## 背景・制約

- 親: [issue-248 backlog.md](../../backlog.md) の「移動速度に応じて腕・脚の振りの回数（周期）を調整する」
- 現状の算出: `cycleSec = min(moveDurationMs × 2, maxWalkCycleSec)`（`Stage07` の `ActorsLayer`）
  - 連続移動時の 1 マスあたり歩数
    - 上限未満（`moveDurationMs` ≦ 600ms、上限 1.2s 時）: 常に 1 歩
    - 上限超え（1000ms 等）: 1 歩超（1000ms で約 1.67 歩）
  - 速い移動ほど 1 マスあたり歩数が少なくなる
- 1 マス単発移動では加速が間に合わない
  - `speedApproachRate = 3 / cycleSec`（時定数 = `cycleSec / 3`）
  - 300ms 移動で到着までの位相は約 1.5rad（片脚 1 歩 = π に届かない）
  - 到着後は `walkingReset` で規定位置へ戻されるため、ほとんど振らずに終わる
- 対象はステージ上の bot のみ
  - 独立 bot は既定の `WALKING_DEFAULTS` で動く（周期のずれには対応しない決定済み、[decision-records.md](../../decision-records.md)）

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- 極端に短い移動時間（スライダー下限 50ms）では周期が数十 ms になり、60fps の描画では振りが崩れて見える
  - 目視確認で問題になれば下限を設ける
