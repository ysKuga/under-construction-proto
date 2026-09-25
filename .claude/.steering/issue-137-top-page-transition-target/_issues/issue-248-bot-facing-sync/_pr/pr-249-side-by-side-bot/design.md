# proto-03 でステージ横に独立 bot を並べて表示する

PR: #249（issue: #248）

## 目的

向き同期の前段として、proto-03 でステージと独立 bot を単純に並べて表示する。

## 対象外

- ステージ上の bot との向きの同期（後続 PR）
- 独立 bot への action（歩行・EN 切れ演出等）の連動

## 実装計画

- [x] proto-03 のステージ部分（`CellTitleProvider` + `Stage07`）と独立 bot を横並びの flex コンテナで包む
- [x] 独立 bot として `BoxBot01` を配置する
  - `actions={[]}`・`interactive={false}` で、ステージ上の mob と同様に静止表示のみとする
  - サイズはステージ上の bot より大きめにし、向きを視認しやすくする
- [x] Storybook（proto-03 の Default story）で表示を確認する
