# expedition の並べ方を狭い画面向けに切り替える

PR: #398（親: #393）

## 目的

`md` 未満の幅で、ステージ・bot の状態表示・マスの情報・手数の履歴を縦に積み、スマホ縦（375px）の幅に収まる並べ方にする。

## 背景・制約

- 並べ方の方針は親で決定済み
  - (../../decision-records.md 2026-10-19 並べ方)
- `StageGroup` の横並び（`flex`）のままでは `md` 未満で崩せない
  - `StageGroup` を廃止し、`stage`・`bot-status-panel` を `stage-section/_contents/` へ移す
- ステージの大きさ（はみ出し）は本 PR の対象外
  - 表示領域の PR で扱う（../../decision-records.md 2026-10-19 表示領域）

## 懸念・リスク

- 移動で `stage`・`bot-status-panel` 配下の相対 import の深さが変わる
- `stage-group` を前例に挙げている `src/components/CLAUDE.md`・`src/components/pages/CLAUDE.md` の記述を直す要あり
