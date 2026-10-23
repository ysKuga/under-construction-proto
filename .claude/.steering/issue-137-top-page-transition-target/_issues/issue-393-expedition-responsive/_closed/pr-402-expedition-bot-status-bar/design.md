# expedition のスマホの幅で bot の状態表示を小さい正方形にする

PR: #402（親: #393）

## 目的

`md` 未満で bot の状態表示（`BotStatusPanel`）を小さい正方形にし、2 段目の縦幅とマスの情報の幅を確保する。

- 状態表示: 独立 bot（64px）を中央、向き矢印（24px）を左上・携行アイテムのボタン（32px）を右下に重ねる
- 向きの同期トグル（`FacingSyncToggle`）: 非表示
- マスの情報（`CellInfoPanel`）: 状態表示と横並び、高さを揃える
- `md` 以上: 従来どおり

## 背景・制約

- 方針は親で決めた
  - (../../decision-records.md 2026-10-22 スマホの幅での bot の状態表示)
- 現状の 375px: `BotStatusPanel` 186×258px、`CellInfoPanel` 幅 141px
- レイアウト変更のため、`story-verifier` で以下の幅を確認する（[layout-change.md](../../../../../../rules/react/layout-change.md)）
  - 375px・767px・768px・1280px

## 懸念・リスク

- タッチ端末ではマスの情報が長押しの間しか出ない（親 backlog で別途検討）
