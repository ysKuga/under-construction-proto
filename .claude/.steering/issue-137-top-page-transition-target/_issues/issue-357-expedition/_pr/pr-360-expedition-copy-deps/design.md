# expedition への依存先のコピー

PR: #360（親: #357）

## 目的

find-path proto-03 が依存する prototypes の実装を、本実装 `expedition` 側へコピーする。

## 背景・制約

- 親 backlog の項目「依存先を本実装側へコピーする」
  - [../../backlog.md](../../backlog.md)
- 本実装から `src/prototypes/`・`_prototypes/` を import しない
  - [src/prototypes/CLAUDE.md](../../../../../../../src/prototypes/CLAUDE.md)
- 本実装の配置: `src/components/pages/expedition/`
- コピー対象（proto-03 からの依存）
  - `src/prototypes/stage/stage-07`
  - `src/prototypes/stage/stage-06/constants`（stage-07 からも参照）
  - `src/prototypes/stage/stage-05/_hooks/use-perspective-control`（stage-07 からの参照、親 backlog 未記載）
  - `src/prototypes/time-control/time-control-03/types`（`time-control-02/types` の re-export、stage-07・energy から参照）
  - `find-path/_prototypes/_stores/energy`
- コピー先
  - stage-07: expedition 配下
  - stage-06/constants・time-control-03/types: stage のコピー先の `constants.ts`・`types.ts` へ同梱
  - energy: `expedition/_stores/energy`
- test はコピーする

## 懸念・リスク

- stage-07 は 41 ファイル（test 10 件含む）と大きい
- stage のコピー先ディレクトリ名、既存の置き場（`_components` 等、複数形）との一貫性を照合して決める要あり
