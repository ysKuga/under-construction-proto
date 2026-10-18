# expedition のレスポンシブ対応

issue: #393（親: #137）

## 目的

expedition をスマホ縦（375px）の幅まで遊べるようにする。

## 背景・制約

- #357 の backlog のレスポンシブ関連 3 項目を切り出した
  - (../issue-357-expedition/decision-records.md 2026-10-19)
- 方針（../issue-357-expedition/decision-records.md 2026-10-18 レスポンシブ）
  - 対象の最小幅: スマホ縦（375px）
  - 並べ方: `md` 未満で縦積み
  - ステージの大きさ: 表示領域（viewport）で盤面の一部を表示する
    - `hexSize` の切替は併用可
  - CSS `scale` は不採用（吹き出しの追従へ scale の補正が要る）

## 懸念・リスク

- 表示領域で盤面の一部を表示すると、吹き出しの追従・pointer の座標計算へ影響する可能性がある
