# proto-03 の独立 bot へステージ上の bot の歩行を同期する

PR: #256（issue: #248）

## 目的

ステージ横の独立 bot へ、ステージ上の bot の歩行（walking / walkingReset）を同期する。

## 背景・制約

- 親: [issue-248 design.md](../../design.md)
- 同期経路は action イベントの許可リスト中継（[issue-248 decision-records.md](../../decision-records.md) 2026-09-26）
- 対象外
  - 向き（face）の同期
  - EN 切れ（energyOut）の同期
  - 脚振り周期のずれへの対応（本 PR で見た目を確認した上で、別途検討）

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- walking はトグル式のため、独立 bot 側の listener が未 attach の間に届いた dispatch を取りこぼすと on/off が反転したままになる
  - 歩行開始はユーザー操作起点のため、マウント直後の取りこぼしは実質起きない想定
