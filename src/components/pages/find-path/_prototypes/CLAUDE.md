# _prototypes/

find-path ページの試作置き場 (issue #137)。route (`/find-path`) / page 実装は未着手。

## 構成

- `proto-01`: 試作。`prototypes/stage/stage-06` (遠近ステージ + actor 位置 ref 版) をページ枠へマウントした土台。ゲーム内容は経路プランニング制 (`planned-path` へ積み上げ → まとめて「実行」で tick 進行)
  - `_contexts/find-path-stores/`: time-control-03 の game-clock / path / planned-path を無改変で束ねる Provider。position / intent は持ち込まない (セル単位・単一 bot と噛み合わないため)。tick は未接続 (PR-C)
  - `_hooks/use-planned-path-steps.ts`: 予定経路をセル単位で append / pop する wrapper hook。tc-03 の planned-path store は無改変
  - `constants.ts` の `GOAL_POSITION`: 到達判定に使うゴールセル
  - `_components/goal-marker-layer/`: `GOAL_POSITION` セルに旗マーカーを表示する非対話レイヤー
- `proto-02`: 試作。proto-01 とは別方式のゲーム内容比較用。隣接セルをクリックするたびに 1 手ずつ即時移動する逐次型 (`planned-path` 積み上げ・tick ループなし)
  - `_hooks/use-adjacent-move.ts`: `currentCell`(state) を軸に隣接判定 → (確認チェックボックス ON なら確認ダイアログ) → `moveActor`(DOM 直書き) を都度実行。「戻る」(直前セルへの逆戻り) も隣接クリックとして自然に許容され、proto-01 の重複選択問題が発生しない
  - `_components/adjacent-move-layer/`: 隣接セルのみ点線枠で選択可能を明示するクリックレイヤー
  - `GOAL_POSITION` は proto-01 の `constants.ts` を import して共用。`START_POSITION` は proto-02 固有
