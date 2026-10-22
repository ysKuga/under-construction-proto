# expedition のスマホの幅で bot の状態表示を横一列のバーにする

PR: #402（親: #393）

## 目的

`md` 未満で bot の状態表示（`BotStatusPanel`）を横一列のバーにし、2 段目の縦幅とマスの情報の幅を確保する。

- 並び: 小さい独立 bot（64px）・向き矢印・ショートカットを横一列
- 向きの同期トグル（`FacingSyncToggle`）: 非表示
- マスの情報（`CellInfoPanel`）: バーの下で全幅
- `md` 以上: 従来どおり

## 背景・制約

- 方針は親で決めた
  - (../../decision-records.md 2026-10-22 スマホの幅での bot の状態表示)
- 現状の 375px: `BotStatusPanel` 186×258px、`CellInfoPanel` 幅 141px
- レイアウト変更のため、`story-verifier` で以下の幅を確認する（[layout-change.md](../../../../../../rules/react/layout-change.md)）
  - 375px・767px・768px・1280px

## 懸念・リスク

- 独立 bot の大きさ（`STANDALONE_BOT_SIZE`）・Canvas の高さが px の定数
  - `md` での切替を CSS だけで行えるか、Canvas の描画が追従するか未確認
- ショートカットのボタン（48px）と 64px の bot の高さの釣り合い
