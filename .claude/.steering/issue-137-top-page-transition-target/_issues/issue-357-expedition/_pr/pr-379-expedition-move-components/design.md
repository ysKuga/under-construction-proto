# content 内部の部品を _components へ移す

PR: #379（親: #357）

## 目的

expedition の content・component が中で使う部品を、親配下の `_components/` へ移す（移動のみ）。

## 背景・制約

- 親 backlog の項目「content と component の置き場を分ける」の 1 本目
  - [../../backlog.md](../../backlog.md)
- 置き場の基準
  - (../../decision-records.md 2026-10-18 content と component)
- 中身は変えない。import・コメント内のパスの付替えのみ

## 移動先

- `stage/_contents/stage-settings` → `stage/_components/stage-settings`
  - `stage-settings/_contents/stage-sliders` → `stage-settings/_components/stage-sliders`
- `shortcuts/_contents/carried-item-button` → `shortcuts/_components/carried-item-button`
- `bot-bubbles/_contents/*` → `bot-bubbles/_components/*`（`overlay-bubble-slots` 含む）
- `_contents/debug-panel` → `_components/debug-panel`
  - 配下のスライダーは `debug-panel/_components/`
  - ページの content に含まれない（story が並べる）ため

## 懸念・リスク

- なし
