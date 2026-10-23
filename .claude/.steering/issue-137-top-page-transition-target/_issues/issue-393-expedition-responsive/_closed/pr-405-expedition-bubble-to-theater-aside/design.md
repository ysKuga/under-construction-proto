# 吹き出しの汎用部品の theater/aside への移動

PR: #405（親: #393）

## 目的

吹き出しの汎用部品を `src/components/theater/aside/` へ移し、expedition 以外からも任意で使えるようにする。

## 背景・制約

- 選択肢の吹き出しを選択肢パネルへ置き換える方針（../../decision-records.md 2026-10-23 選択肢パネル）
  - 本 PR はその下準備
- 対象
  - `expedition/_components/bot-bubble` → `theater/aside/bot-bubble`
  - `expedition/_components/bubble-slots` → `theater/aside/bubble-slots`
- 中身は変えない。移動と参照の付け替えのみ
- aside（傍白）の定義: [docs/terminology/theater/actor/aside/](../../../../../../../docs/terminology/theater/actor/aside/README.md)
- ベース: PR #404 のブランチ（#393 の steering の競合を避けるため）

## 懸念・リスク

- aside の定義は「hover・クリック等で操作する要素」を対象外とする。`BotBubble` は hover・クリックの機能を持つ
  - 選択肢の吹き出しを外した後（後続 PR）、操作の機能を残すか見直す
