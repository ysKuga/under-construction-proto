# proto-03 の独立 bot へステージ上の bot の EN 切れを同期する

PR: #262（issue: #248）

## 目的

ステージ横の独立 bot へ、ステージ上の bot の EN 切れ（energyOut）を同期する。

## 背景・制約

- 親: [issue-248 design.md](../../design.md)
- 同期経路は歩行と同じ action イベントの許可リスト中継（[issue-248 decision-records.md](../../decision-records.md) 2026-09-26）
  - ステージ上の bot 宛ての energyOut は停止待ち（`useEnergyOutAfterStop`）を経て dispatch されるため、中継すれば独立 bot も停止後に演出する
- 対象外
  - 向き（face）の同期

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- energyOut はトグル式のため、独立 bot 側の listener が未 attach の間に届いた dispatch を取りこぼすと、EN 切れ/回復が反転したままになる
  - EN 切れは経路実行（ユーザー操作起点）で起きるため、マウント直後の取りこぼしは実質起きない想定（walking と同じ）
