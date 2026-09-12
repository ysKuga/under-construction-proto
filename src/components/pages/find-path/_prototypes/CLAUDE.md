# _prototypes/

find-path ページの試作置き場 (issue #137)。route (`/find-path`) / page 実装は未着手。

## 構成

- `proto-01`: 試作。`prototypes/stage/stage-06` (遠近ステージ + actor 位置 ref 版) をページ枠へマウントした土台
  - `_contexts/find-path-stores/`: time-control-03 の game-clock / path / planned-path を無改変で束ねる Provider。position / intent は持ち込まない (セル単位・単一 bot と噛み合わないため)。tick は未接続 (PR-C)
  - `_hooks/use-planned-path-steps.ts`: 予定経路をセル単位で append / pop する wrapper hook。tc-03 の planned-path store は無改変
  - `constants.ts` の `GOAL_POSITION`: 到達判定に使うゴールセル
  - `_components/goal-marker-layer/`: `GOAL_POSITION` セルに旗マーカーを表示する非対話レイヤー
