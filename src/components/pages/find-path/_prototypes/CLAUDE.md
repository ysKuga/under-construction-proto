# _prototypes/

find-path ページの試作置き場 (issue #137)。route (`/find-path`) / page 実装は未着手。

## 構成

- `proto-01`: 試作。`prototypes/stage/stage-06` (遠近ステージ + actor 位置 ref 版) をページ枠へマウントした土台
  - `_contexts/find-path-stores/`: time-control-03 の game-clock / path / planned-path を無改変で束ねる Provider。position / intent は持ち込まない (セル単位・単一 bot と噛み合わないため)。tick は未接続 (PR-C)
  - `_hooks/use-planned-path-steps.ts`: 予定経路をセル単位で append / pop する wrapper hook。tc-03 の planned-path store は無改変
  - `constants.ts` の `GOAL_POSITION`: 到達判定に使うゴールセル。隅 (0,0) / (cols-1,rows-1) は `ActorsLayer` の静的 bot 表示に占有されクリックが吸われるため避ける
  - `_components/goal-marker-layer/`: `GOAL_POSITION` セルに旗マーカーを表示する非対話レイヤー
  - `_hooks/use-jump-unlock.ts`: box-bot の jump 回数(3 回)で「実行」を解放する hook。home `_prototypes/proto-01` の `useWalkUnlock` と同型
  - 「実行」の実行前アンロック操作は `ActionBar` の専用「ジャンプ」ボタン(box-bot 本体クリックではない)。理由: 傾いた床上の 3D 空間で player bot と `PlannedPathLayer` のクリック領域が奥行きにより競合し、bot クリックが安定して拾えなかったため
