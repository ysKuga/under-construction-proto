# find-path の履歴パネルを bot の状態表示の横へ置く

PR: #328（親: #315）

## 目的

手数の履歴パネルを bot の状態表示の横に、同じ高さで並べる。

## 背景・制約

- 履歴パネルは #327 で操作パネルの下に置いた（[../../_closed/pr-327-stage-move-history-display/design.md](../pr-327-stage-move-history-display/design.md)）
- 子同士の配置は並べる側（`stage-area`）の className に集約する（`src/components/CLAUDE.md`「レイアウト」）
- 履歴パネルは `stage-area` からのみ使うことになるため、`stage-area/_contents/` へネストする

## 仕様

- `stage-area` 内で、bot の状態表示（独立 bot + 向きインジケータ）と履歴パネルを flex で横に並べる
- 履歴パネルの高さは状態表示に揃え、中身が溢れたらパネル内でスクロールする

## 懸念・リスク

- なし
