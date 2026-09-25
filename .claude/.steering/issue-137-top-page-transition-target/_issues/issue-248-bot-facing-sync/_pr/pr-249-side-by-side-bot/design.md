# proto-03 でステージ横に独立 bot を並べて表示する

PR: #249（issue: #248）

## 目的

向き同期の前段として、proto-03 でステージと独立 bot を単純に並べて表示する。

## 背景・制約

- 親: [issue-248 design.md](../../design.md)
- 対象外
  - ステージ上の bot との向きの同期（後続 PR）
  - 独立 bot への action（歩行・EN 切れ演出等）の連動

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- 独立 bot 追加で proto-03 に BoxBot01 の Canvas が 1 つ増える（描画負荷）
