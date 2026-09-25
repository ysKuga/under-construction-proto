# ステージ上の bot の向きを同期する独立 bot 表示

issue: #248（親: #137）

## 目的

ステージ上で動作する bot とは別に bot を独立表示し、「現在どちらを向いているか」を同期して表示する。

## 背景・制約

- 親: [issue-137 backlog.md](../../backlog.md) の同名項目からの分割
- 現状、ステージ上の bot に向き変更（spin 相当）はない（親 [design.md](../../design.md)「2. 操作キャラクター (bot)」）
- 対象は proto-03 を優先する

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- 同期元となる「向き」の state が未定義
- 独立表示する bot の配置先が未定
