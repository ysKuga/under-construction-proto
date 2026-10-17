# 決定事項（expedition への依存先のコピー）

- 2026-10-17: コピー先を決めた
  - stage-07: expedition 配下（theater/stage への汎用化は見送り）
  - stage-06/constants・time-control-03/types: stage のコピー先へ同梱（`src/types` 等の共通置き場は使わない）
  - stage-07 が `stage-05/_hooks/use-perspective-control` にも依存するため、コピー対象へ追加した
- 2026-10-17: stage のコピー先を `expedition/_stage-components/hex-stage` とした
  - stage はゲームの役割として意味を持つため、`_components` と分ける
  - 命名は既存の `_game-phases`・`_action-hooks` と同じ形
- 2026-10-17: コピー時の調整
  - time-control-03/types は `ActorId` のみ使用していた
  - story の `title` 明示指定を外した（コピー元と ID が重複するため。自動生成タイトルに `hex-stage` が含まれる）
  - コメント内の名前（`Stage07`・find-path 等）は改名項目へ委ね、そのまま残した
- 2026-10-17: レビュー指摘への対応
  - `ActorId`: `Actor` 型を `src/types/theater/actor` へ定義し `Actor['id']` で参照する
    - 当初の `hex-stage/types.ts` では energy store が部品（hex-stage）の型へ依存するため
    - 置き場は用語集 `docs/terminology/theater/actor` に対応させた
  - `_stage-components` の置き場・依存方向を `src/components/pages/CLAUDE.md` へ追記した（`_components` と同じ最下層）
  - store の集約 index（`_types`・`_constants`）を作成した
  - 未使用の `CELL_TRANSITION_MS` は同梱しない
