# expedition への proto-03 本体のコピー

PR: #365（親: #357）

## 目的

find-path proto-03 本体を、本実装 `expedition` へコピーする。

## 背景・制約

- 親 backlog の項目「proto-03 本体を expedition へコピーする」
  - [../../backlog.md](../../backlog.md)
- 構成は変えず import の書換のみ行う
  - レイアウト分割・改名は後続 PR
  - (../../decision-records.md 2026-10-17 進め方)
- 依存先は PR #360 でコピー済み
  - [../../_closed/pr-360-expedition-copy-deps/design.md](../../_closed/pr-360-expedition-copy-deps/design.md)
- 本実装から `src/prototypes/`・`_prototypes/` を import しない
  - [src/prototypes/CLAUDE.md](../../../../../../../src/prototypes/CLAUDE.md)
- コピー元: `src/components/pages/find-path/_prototypes/proto-03`（225 ファイル、test 45 件）
- コピー先: `src/components/pages/expedition/` 直下
  - `_stores/` はコピー済みの `energy`・集約 index（`_types`・`_constants`）と合流する
- import の書換対象
  - `@/prototypes/stage/stage-07/*` → `expedition/_stage-components/hex-stage/*`
  - `@/prototypes/stage/stage-06/constants` → hex-stage の `constants.ts`
  - `@/prototypes/time-control/time-control-03/types` → `Actor['id']`（`src/types/theater/actor`）
  - `find-path/_prototypes/_stores/energy` → `expedition/_stores/energy`
- 追加のコピー対象（親 backlog 未記載）
  - `find-path/_prototypes/_components/energy-debug-panel`（`energy-sliders` から参照）
  - コピー先: `expedition/_components/energy-debug-panel`

## 懸念・リスク

- 225 ファイルと大きい
