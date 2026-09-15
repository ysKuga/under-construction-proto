# トップページ遷移先の新設（ステージ + 操作 bot + time-control 統合）

issue: #137

## 目的

トップページから遷移する新ページを作る。ステージ・操作キャラクター(bot)・time-control によるイベント管理を 1 ページに統合する。

## 背景・制約

- `src/app/CLAUDE.md`: `src/app/` は配線のみ、実装は `src/components/pages/` へ置く
- `src/prototypes/README.md`: 若いバージョンからの import を許容（バージョン違い並存）。pages 配下でも同様の運用
- 現状:
  - `src/components/pages/home/index.tsx` = BoxBot 単体表示のみ
  - `src/components/pages/home/_prototypes/proto-01/index.tsx` = ジャンプ3回 →「歩く」ボタン解放の操作土台（EventTarget 共有 + `useBoxBotActionDispatcher`）
- issue #131（トップページ改修）は close 済。積み残し: rxjs 適用（挙動と UI の分離 / 長押し util / `jumpCount` の Observable 化）

## ゲーム内容

経路プランニング制（キャラ操作 → ゴール）。

- グリッドステージにスタート・ゴール配置
- プレイヤーが移動先セルを順に指定 → `planned-path` store に積む
- 「実行」で time-control tick に乗せて bot が 1 手ずつ歩く
- 障害物 / 歩数制限 / 一方通行セルでパズル性（初期は最小、まず到達判定まで）
- proto-01 の「ジャンプ 3 回 → 歩く解放」を実行前アンロックとして前段に組込み可
- time-scale / progress-mode をそのまま早送り・巻戻し UI に流用
- 新規実装は「ゴール到達判定」「経路積み UI」が中心。`planned-path` / `schedule-preview` / `path` store と stage-04 の `MoveIntent` は流用

## 基本構成案

### 1. ステージ

- 遠近表現: 奥ほど小さい。CSS で検討（`perspective` / 行位置に応じた `scale` 補間 / `transform`）
- 既存資産: `src/prototypes/stage/stage-04`
  - layer 分割（`GeoLayer` / `ActorsLayer`）
  - absolute 位置指定
  - `MoveIntent` イベント駆動（`{ source, target }` を dispatch、位置反映は `resolveMoveIntent` に一本化）
  - 境界処理: actor click = wrap / keyboard = clamp / cell click = noop
- `src/prototypes/README.md` の「奥行 → z-index 問題」論点あり
  - top/left に加え z-index も変動させるか / 配列内部を移動に伴い並べ替えるか

### 2. 操作キャラクター (bot)

- 使用: `src/components/theater/figure/box-bot` の `BoxBot01`（ゲーム内 actor 用、表示領域 = 設置領域 #108）。`samples/figure/box-bot` はデモ用見本のため不使用
  - walking action は box-bot-01 では未実装（samples 側にあり、レジストリ形式で復帰予定）
  - 向き変更（spin 相当）なし・「歩く」はその場足踏みで位置移動を伴わない
- proto-01 の EventTarget 共有パターンを流用
- stage-04 の grid 移動と box-bot の three.js Canvas をどう重ねるか要検討
  - `src/components/pages/home/_prototypes/ui-three` の知見（drei `Html` で 3D 投影可、ただし `occlude` が効かず背面ボタンが手前に浮く課題）

### 3. time-control によるイベント管理

- 既存: `src/prototypes/time-control/time-control-03`
  - `_stores/`: `game-clock` / `actor` / `actor-settings` / `intent` / `path` / `planned-path` / `position` / `async-sample`
  - `_events/_event-listeners/` 群（dispatch-target / set-fixed-path-steps / set-time-scale / toggle-progress-mode 等）
  - `_computed/` computed layer
  - `_components/`: `action-bar` / `schedule-preview` / `stage-view` / `actor-controller` / `action-log-panel`
- bot の move / action を tick に乗せる
- store 群をページスコープへどう持ち込むか検討（prototype は若いバージョンからの import 許容方針）

## 実装計画

前提:

- [x] 配置先確定: 新 route `/find-path`（`src/app/find-path/page.tsx` → `src/components/pages/find-path/`。`src/app/CLAUDE.md` の re-export ルール踏襲、`components/pages/README.md`「使用構造」へ追記）
- [x] ページ枠の試作作成 → `src/components/pages/find-path/_prototypes/proto-01/`（`prototypes/stage/stage-05` をページ枠へマウント）。route `/find-path` / page 実装・トップからの遷移導線は段階 3 以降へ先送り（先に time-control 込みで組んでから page 化する方針）

段階 1: ステージ（遠近適用）

- [x] 遠近ステージ試作 → `src/prototypes/stage/stage-05`（actor 未搭載、傾きスライダー付き）
- [x] 遠近表現の方式確定 → CSS `perspective` + `rotateX` で床面を台形化（当初の CSS 2D scale 補間は不採用へ転換）
- [x] 傾き制御を ref 経由に → `usePerspectiveControl` が `floorRef` から `--floor-tilt` を直接書換え。スライダー操作でセル群は再レンダリングされない
- [x] 奥行きに伴う z-index / 描画順の扱い → 透視変換に一任、z-index 不使用。複数 actor / 障害物の前後（DOM 順 or 逆 rotateX）は段階 2 以降

段階 2: bot 配置

- [x] `theater/figure/box-bot` の `BoxBot01` を stage-05 に actor として新規搭載（samples 版は不使用。当初 samples で搭載 → box-bot-01 へ差し替え）
  - [x] 床と同じ 3D 空間に乗るため逆 `rotateX` で立て直す。セル座標 → 画面位置の対応付け（floor に `preserve-3d`、box-bot を子として絶対配置 + 逆 `rotateX(calc(-1 * var(--floor-tilt)))`、位置は % 補間）
  - [x] stage-04 の click / keyboard 移動配線（`MoveIntent`）を持ち込む（context / keyboard hook は stage-04 から import 共有、layer は grid 座標系用に新規）
- [x] grid 移動と three.js Canvas の重ね方（`ui-three` の occlude 課題を踏まえる）— box-bot-01 は表示領域 = 設置領域で Canvas が `cellSize` に収まり、単体では occlude 未顕在化。複数 actor / 障害物の z 順は段階 2 以降として stage-05 README に残す

段階 3: time-control 適用（詳細は [pr-142-time-control-integration/design.md](_pr/pr-142-time-control-integration/design.md)）

- [x] time-control-03 の store 群をページ Context 構成へ束ねる（`FindPathStoresProvider`。game-clock / path / planned-path は無改変 import、position / intent は stage-06 `actor-node-registry` へ差し替え）
- [x] bot の move / action を tick 管理へ接続（`useFindPathTick`。PR-A #143 / PR-B #151 / PR-D #152 / PR-C #153）

段階 4: ゲーム内容の深堀（詳細は [pr-154-find-path-stage4-game-content/design.md](_pr/pr-154-find-path-stage4-game-content/design.md)）

- [x] スタート / ゴール配置、ゴール到達判定 — PR-E
- [x] 経路積み UI（セル指定 → `planned-path` へ push）— 段階 3 PR-C で前倒し実装（`PlannedPathLayer`）
- [x] 「実行」で tick 進行 → bot が 1 手ずつ歩く配線 — 段階 3 PR-C で前倒し実装（`ActionBar` + `useFindPathTick`）
- [x] proto-01「ジャンプ → 歩く解放」を実行前アンロックとして前段に接続 — PR-F
- [ ] 障害物 / 歩数制限 / 一方通行セル（パズル性、優先度低）

段階 5: ゲーム性強化（2026-09-12 `game-evaluation` スキルによる評価結果を受けて着手）

- [x] ジャンプ 3 回アンロックの撤去。経路プランニングと無関係な前置き操作のため
- [x] stage-06 の操作対象外（静的表示のみ）の bot を削除
- [x] 経路未選択時は「実行」「1 手戻す」を disabled に
- [x] 「実行」完了（経路を歩き切った）時に予定経路をリセット
- [x] 予定経路の途中セルは到達ごとに 1 つずつフェードアウトする（`PlannedPathCellRegistryProvider` で DOM 直書き、再レンダリングなし）
- [x] 同一マスを複数回選択した場合の番号表示。`PlannedPathCellRegistryProvider` をセル単位から order（経路上の通し番号）単位へ変更し、出現ごとに個別フェードアウト可能に。表示は `PlannedPathLayer` の `variant` で 2 パターン比較試作（`list`＝カンマ列挙+ellipsis・既定 / `stacked`＝要素を重ねて最若番号を手前に表示。消化ごとに次の番号を最前面へ昇格、残り1枚になったら半透明に戻す。Storybook 'Stacked Variant' story）。加えて `allowDuplicateSelection=false` で重複選択自体を禁止する方式も試作（Storybook 'No Duplicate Selection' story、最終的にはこちらを既定にする方針）。3方式のどれを採用するかは段階 5 の別項目（隣接マス制限）と合わせて後日決定
- [x] 経路選択を隣接マスのみに制限。選択可能マスは点線等の見た目に変更し選択可能な状態を明示する（proto-01 は先読み前提のため対象外（決定事項参照）、proto-02（`use-adjacent-move.ts` の `isAdjacent` ガード + `adjacent-move-layer` の点線枠）・proto-03（`useHexMove` の `isHexAdjacent` + `MoveTargetLayer` の点線六角形）で対応済み。チェック漏れをドキュメント棚卸しで発見、2026-09-14 追記）
- [x] 到達済みマスのみ「表示」する。未到達マスは非表示、ゴール旗は隣接（斜め含む8方向）時のみ表示、未到達マスへの選択は不可（`VisibilityRegistryProvider` 新設、proto-02 のみ対応。理由は下記決定事項）。**本採用可否は保留、後日判断**（下記決定事項）
- [ ] 「1 手戻す」（計画上の消費取消）と「戻る」（到達済みマスへ消費を伴い異動する行動）を別枠の操作として分離検討。「戻る」は一見メリットのない行動のため、ギミックによるインセンティブ付与・退避行動としての活用など仕組みの導入を検討
- [ ] 障害物 / 歩数制限 / 一方通行セル（段階 4 から継続。「挑戦」「工夫」実現の中心方針）
- [x] （検討）bot を進行方向へ向ける（proto-03 のみ対応。他 proto は未着手）
- [x] （検討）進行時に歩くモーションを再生する（proto-03 のみ対応。他 proto は未着手）
- [ ] （検討）「実行」中は停止を挟まず歩く速度を維持する。途中の操作介入があった時点で停止する
- [ ] （検討）到達済みマス表示ON時、または視界制限自体を採用しない（全マス表示）場合に、隣接以外の目的地セルをクリックすると経路探索により自動で経路を生成し移動する。現行の「隣接セルを1手ずつクリック」方式に加える、または代替する入力方式として検討。先行実装: 旧世代 stage-04 で経路探索を実装済み（[stage-04-pathfinding/design.md](../_closed/20260716-stage-04-pathfinding/design.md)、BFS 想定・単一 actor 前提。「予備」フェーズで経路計算 → 「実行」フェーズで逐次移動、`stage-time-control` の時間管理機構に依存）。find-path 側は tick 駆動でなく DOM 直書き + CSS transition の逐次移動（`useAdjacentMove`/`useHexMove`）のため、経路計算結果をどう逐次移動へ渡すかは移植時に要検討

## 決定事項

- 2026-09-06: issue #137 起票。トップページ改修（#131）の後続テーマとして分離
- 2026-09-06: route 名 `/find-path` 確定。`proto-02` 枠でなく新 route（トップからの遷移先が要件のため）
- 2026-09-06: ゲーム内容は経路プランニング制に確定（tick 実行前にプレイヤーが `planned-path` を組む方式）
- 2026-09-06: 着手順を段階 1 ステージ → 段階 2 bot 配置 → 段階 3 time-control → 段階 4 ゲーム内容深堀 に確定
- 2026-09-06: 遠近方式は CSS 2D scale 補間で暫定着手。試作は `stage-05` 新設
- 2026-09-06: actor は box-bot を使用。以後このプロジェクトの操作キャラは基本 box-bot に統一（stage-01〜04 の `Robot01` は旧世代の暫定）
- 2026-09-06: stage-05 は現時点で actor 未搭載。段階 2 で box-bot を新規搭載する（`Robot01` は持ち込まない）
- 2026-09-07: 遠近方式を CSS `perspective` + `rotateX`（床面台形化）へ転換。scale 補間（`_lib/perspective.ts`）は破棄し stage-05 を差し替え。three.js 3D 化は引き続き不採用
- 2026-09-07: 傾きは ref 経由で制御（`--floor-tilt` を style 直接書換え）。再レンダリング回避が目的。制御対象は当面 tilt のみ（pan/zoom は将来）
- 2026-09-07: stage-05 に box-bot を actor 搭載（段階 2）。floor に `preserve-3d`、box-bot を floor の子として絶対配置し逆 `rotateX` で直立。`--floor-tilt` の CSS 変数継承で傾き変更に再レンダリングなしで追従。position 管理・keyboard 移動は stage-04 から import 共有、grid 座標系依存の `geo-layer` / `actors-layer` は新規作成
- 2026-09-07: actor は `theater/figure/box-bot` の `BoxBot01`（ゲーム内 actor 用）に確定。`samples/figure/box-bot` はデモ用見本のため不使用。当初 samples で搭載していたが差し替え。box-bot-01 は表示領域 = 設置領域（#108）で Canvas が `cellSize` に収まり、samples 版で必要だった `FOOTPRINT_RATIO` / `canvasCenterOffset` の実測補正を全廃
- 2026-09-07: box-bot-01 の fov 自動算出を overscan（表示領域 / 設置領域）基準へ変更し、`style.height` で bot を素直に拡大縮小できるようにした（従来は `DEFAULT_HEIGHT` 未満でクリップ）。`canvasHeight` 明示時（overscan > 1）の見え方は不変
- 2026-09-07: box-bot-01 の 表示領域 = 設置領域（#108）は維持する（`DISPLAY_RATIO` で表示領域を大きくする案は「設置領域と表示領域のずれ」を嫌い破棄）。stage-05 では actor サイズを `botSize` prop で指定し、マスのサイズ（`size / cols`）とは独立させる（マスと bot 関連サイズは合わせない）
- 2026-09-07: 傾いた床の上で r3f Canvas が設置領域より小さくなる問題（既定の `getBoundingClientRect` 実測が perspective で縮む）を、box-bot-01 の `<Canvas resize={{ offsetSize: true }}>` で解消（`offsetWidth/Height` = レイアウト寸法で実測）
- 2026-09-07: **ゲーム操作（actor 移動等）で React 再レンダリングを基本的に起こさない方針**。傾き制御を ref 経由にしたのと同じ狙い。現状 `actors-layer` は position が state のため actor 移動で再レンダリングし、同居する静的 bot も巻き込む。段階 3（time-control / tick）で position・move を ref / r3f `useFrame` ベースへ寄せる際に合わせて解消する
- 2026-09-07: 同一マスに複数 bot 表示可（box-bot-01 を複数配置、位置を translate でずらす）
- 2026-09-07: **tilt 依存の actor 位置ズレは解決**。原因の主因は Canvas < 設置領域のずれ（`resize={{ offsetSize: true }}` で解消）。残る `translate(-50%, -53%)` 固定値ぶんは許容範囲。stage-05 の上段（奥行 row 0）静的 bot をグリッド外縁へ寄せ tilt 全域で検証済み
- 2026-09-08: ページ枠は route/page を先に作らず試作 `src/components/pages/find-path/_prototypes/proto-01/` として先行（`prototypes/stage/stage-05` をマウントするだけ）。段階 1・2 を prototype 空間で進めたのと同じ流れ。`/find-path` route・page 実装・トップからの遷移導線は、段階 3（time-control 適用）まで組んでから page 化するタイミングで行う
- 2026-09-12: route/page 化を一旦取りやめ。page 実装は `_prototypes` を参照しない方針に変更（試作コードをそのまま正式実装として使い回さない）。route/page 化より先にゲーム性の検討・強化（段階 5）を優先する
- 2026-09-12: `game-evaluation` スキルで段階 1〜4 実装を評価。「おもしろみ」10 要素いずれにも該当なし（挑戦・工夫は失敗条件が無いため機能していない）、「ジャンプ 3 回 → 実行アンロック」は経路プランニングと無関係な操作という指摘を受け、段階 5（ゲーム性強化）を実装計画へ追加
- 2026-09-12: 段階 5 着手。ジャンプ 3 回アンロック撤去（`ActionBar` から「ジャンプ」ボタン・`useJumpUnlock`・関連 `eventTarget` 配線を削除、「実行」は常時有効）と、stage-06 `ActorsLayer` の動作確認用静的 bot（隅 2 体）削除を実施。`GOAL_POSITION`（隅回避の理由が静的 bot 占有だった）のコメントも合わせて整理
- 2026-09-12: 経路未選択時の「実行」「1 手戻す」disabled 化（`usePlannedPathStore` で予定経路の有無を購読）と、「実行」完了時の予定経路クリア（`useFindPathTick` の `applyNextStep` で最後の 1 歩消化時に反映。即時性のため tick ループの `complete` 依存はやめた）を実施。bot の進行方向転換・歩行モーション・実行中ノンストップ移動（介入時のみ停止）は検討事項として実装計画へ追加（具体設計は未着手）
- 2026-09-12: 予定経路が一括で消える見た目が唐突との指摘を受け、途中セルは到達ごとに 1 つずつフェードアウトするよう変更。新設 `PlannedPathCellRegistryProvider`（`ActorNodeRegistryProvider` と同型）がセル DOM を ref 登録し、`useFindPathTick` が到達時に `style.opacity` を直書きする（React state を経由しないため再レンダリングなし）。最後の 1 歩（歩き切り）は既存どおり `setPlannedPath([])` の一括クリアのまま変更していない
- 2026-09-12: フェードアウト済みセルの再選択バグを修正。DOM 直書きは React の style diffing に乗らず、再レンダリング後も前回 props（`opacity: 1`、変化なし判定）との比較でスキップされ opacity: 0 のまま残っていた。`PlannedPathCellRegistryProvider` に `resetCell` を追加し `PlannedPathLayer` の `onClick` で明示的に呼んで解消
- 2026-09-12: 同一根本原因（style diffing スキップ）が「実行」完了時の一括クリアでも発生していたバグを修正。fadeOutCell 済みセルは `setPlannedPath([])` の再レンダリングだけでは opacity: 0 のまま残る（重複選択の有無に関わらず発生。中間セルが常に該当）。`PlannedPathCellRegistryProvider` に `resetAllCells` を追加し、`useFindPathTick` の歩き切り分岐で明示的に呼んで解消
- 2026-09-12: 同一セルを経路上で複数回通る場合（例: 1→2→1→2 の往復）に、初回通過時点でフェードアウトし、後続の再訪問前でも見えないままになるバグを修正。`useFindPathTick` の `applyNextStep` で「経路上にまだ同じセルが残っているか」を判定し、残っていればフェードアウトを見送る（最後の訪問まで選択済みの見た目を保つ）
- 2026-09-12: 走行中（tick 進行中）に `PlannedPathLayer` でセルを追加でき、追加した指定が実行中の残り経路（path store）に反映されず「消化されない指定」になる不具合を修正。`useFindPathTick` に `isRunning` を追加、`ActionBar`/`PlannedPathLayer` へ配布し走行中は「実行」「1 手戻す」・セル選択を全て disabled にする。配布のため `useFindPathTick` の呼び出し元を `ActionBar` から親（`FindPathProto01` 内の新設 `FindPathContent`）へ移した
- 2026-09-12: 同一セルを複数回選択した際「最終的な番号のまま更新されない」問題（例: 1→2→1→2→1→2 で A=5,B=6 のまま tick1〜4 中も変化しない）を報告受け調査。原因はセル単位の `orderByCell`（`Map<string,number>`）が同一セルの複数出現を1つの番号でしか表現できず、`fadeOutCell` もセル単位の判定に頼っていたこと。`PlannedPathCellRegistryProvider` を order（経路上の通し番号、1 始まりでつねに一意）単位へ再設計し解消。あわせて表示方式を `PlannedPathLayer` の `variant` で 2 パターン比較試作（詳細は実装計画へ）
- 2026-09-14: `stacked` variant の見た目を調整。(1) ずらし表示（margin）をやめ完全に重ねる（下の要素の端が見えていたのを解消）、(2) 重なり枚数が 2 以上のときだけ最前面を不透明にする（1 枚のみは通常どおり半透明）、(3) 消化ごとに次の番号を最前面へ動的に昇格（`PlannedPathCellRegistryProvider` の `fadeOutStep` に `promoteOrder`/`promoteAsLast` を追加、`variant: 'stacked'` のみ有効）、(4) 昇格後の重なりが残り 1 枚になったら半透明に戻す
- 2026-09-14: 重複選択自体を禁止する方式（最終方針）を `PlannedPathLayer` の `allowDuplicateSelection` prop として試作。false のとき選択済みセルのクリックを無視する。Storybook 'No Duplicate Selection' story で比較確認できるようにした
- 2026-09-14: `list` variant で「数字だけ消えてセルの背景・枠線が選択中のまま残る」不具合を修正。`list` variant のセル背景・枠線は `hasOrders`（React state）に基づく静的な値で、番号個別の `fadeOutStep`（DOM 直書き）とは独立していたため。セルの最後の番号が消化されたタイミングで `fadeOutCell` を新設して呼び、セル（`button`）自体の背景・枠線も DOM 直書きで transparent に戻すようにした（`PlannedPathCellRegistryProvider` に `registerCellNode`/`fadeOutCell` を追加、`variant: 'stacked'` は元々セル自体が透明なため no-op）
- 2026-09-14: 段階5「到達済みマスのみ表示」を実装。当初 proto-01（積み上げ→まとめて「実行」方式）へ実装したが誤りと判明し取消（3 コミット reset）、proto-02（隣接クリック逐次移動方式）へ実装し直した。理由: 「到達済みマスのみ表示」は視界制限そのもので、未到達マスへの選択を不可にすると先読みができなくなる。proto-01 は「複数マス先読みして積み上げてから実行」が存在意義のゲーム性のため、視界制限とは根本的に矛盾する（実装検証時、隣接2マス先を同時に予定経路へ積もうとしたら2マス目が非表示で選択できず、1マスずつ実行を繰り返す破目になった）。段階5の「隣接マス制限」も同じ理由で proto-02 向けの検討事項としていた経緯（158行目）と整合する
  - 未到達マスは非表示（`display: none`）。ゴール（旗）マーカーは到達済みマスに隣接（斜め含む8方向）していれば表示。未到達マスへの選択（クリック）は非表示により自然に不可
  - `VisibilityRegistryProvider` を proto-02 配下に新設（`ActorNodeRegistryProvider` と同型、`useState` 不使用・ref + DOM 直書き）。到達済みセルを ref の Set で保持し、可視判定は「到達済みセル自身、またはその8近傍」
  - `AdjacentMoveLayer` の各セル button・`GoalMarkerLayer`（proto-01 と共用）の旗 div を `registerVisibilityNode` で登録。`useAdjacentMove` の `handleCellClick` で `moveActor` と同時に `markVisited` を呼ぶ
  - `GoalMarkerLayer` は proto-01 とも共用のため `registerVisibilityNode` を optional prop にし、未指定（proto-01）時は従来どおり常時表示のまま維持。proto-01 自体への機能追加は行わない
  - Storybook 両 story で Playwright headless 確認（proto-02: 初期可視4セル→隣接セルへ移動後6セルへ拡大、ゴール旗は非隣接時非表示、console error なし。proto-01: 旗は従来どおり常時表示のまま変化なし）
- 2026-09-14: 上記実装のレイアウト崩れを修正。初期時、bot（0,0）の右に本来 (1,0) のみが選択可能に見えるべきところ、(1,0) の右隣にも点線枠のセルが並んで見える不具合をユーザー指摘で発覚。原因は CSS Grid の auto-placement が `display: none` の item を配置計算から除外すること。25 セル中大半を非表示にすると、残った可視セルだけが grid 先頭から詰めて再配置され、本来 (0,1)（bot の真下）であるべきセルが (1,0) の右隣に来ていた（tilt=0/55 いずれでも再現、遠近表現とは無関係と切り分け済み）。`AdjacentMoveLayer`・`GoalMarkerLayer` の各セル style に `gridColumn: col + 1` / `gridRow: row + 1` を明示指定して解消。Playwright で tilt 0/55 双方・移動後の可視範囲拡大を再確認
- 2026-09-14: proto-02 の隣接移動判定（`isAdjacent`）へ斜め方向（8方向）を追加し、切替可能にした。`isAdjacent` に `allowDiagonal` 引数を追加（既定 4 方向のロジックはそのまま、8方向はチェビシェフ距離1で判定）。「斜め移動を許可する」チェックボックス（非制御、`diagonalCheckboxRef`）を新設し、変更時 `handleDiagonalToggle` が現在セル基準で選択可能セル（点線枠）を全セル走査で再計算する。従来の差分更新用 `neighborsOf`（4方向固定）は全セル走査方式に統合したため削除。視界（`VisibilityRegistryProvider`、常に8方向固定）とは独立した設定で、視界機能への影響なし。Playwright で斜めOFF/ON切替・斜め移動実行・ONからOFFへ戻す動作を確認
- 2026-09-14: 到達済みマスのみ表示（視界制御）の本採用可否は保留、後日判断する。実装自体は proto-02 へ反映済み（PR 化）だが、ゲーム性への影響（探索要素の強さ・UX）を踏まえた最終判断は別途行う。段階5「経路選択を隣接マスのみに制限」（104行目）の採否判断とあわせて検討
- 2026-09-14: proto-02 の未到達マス非表示制御を「視界」と「到達済み」の2軸へ分離。従来は`VisibilityRegistryProvider`の可視判定が「訪問済み全セルの8近傍の和」の一本化だったが、以下に変更
  - 視界: 現在地基準の8近傍（斜め含む）のみ、常時可視。過去に訪れた他セルの周辺は視界に含めない
  - 到達済み: 訪問履歴セルそのもの（8近傍でなくセル自身のみ）の表示可否を `setShowVisited` でON/OFF切替可能なオプションに（既定 ON）。UIに「到達済みマスを表示する」チェックボックスを追加
  - 未到達（視界外かつ到達済み表示条件を満たさない）は従来どおり単純に `display: none`
  - `VisibilityRegistryProvider` に `currentRef`（現在地）・`showVisitedRef`（表示オプション）を追加、`markVisited` は現在地更新も兼ねるよう変更。可視状態の再計算は差分更新（変更セルの8近傍のみ）から登録済み全セル走査へ統一（グリッドが5x5と小規模なため単純さ優先）
  - Storybook + Playwright headless で確認: 初期状態（視界のみ4セル可視）→ 移動を重ね訪問済みセルが視界外になった状態で到達済み表示ON/OFF切替 → 該当セルの表示/非表示が追従、console error なし
- 2026-09-14: 上記実装で未到達マスの床タイル（`GeoLayer`、stage-06）が非表示にならない不具合をユーザー指摘で発覚。`VisibilityRegistryProvider` は `AdjacentMoveLayer`（透明なクリック用オーバーレイ button）と `GoalMarkerLayer`（旗）のみ登録しており、下敷きの床タイル（グレー背景 `#f1f5f9` + 枠線、`interactive={false}` 時は非対話 `<div>`）は別レイヤーで常時全セル描画されたままだったため、視界外セルでもタイルの見た目自体は残っていた
  - `GeoLayer`（stage-06）に `registerVisibilityNode` prop を追加（`GoalMarkerLayer` と同型、省略時は常時表示のまま）。各セルの button/div の ref から登録する
  - `Stage06` に `registerCellVisibilityNode` prop を追加し `GeoLayer` へ伝播。`NodeKind` に `'floor'` を追加
  - `GeoLayer` の `cellStyle` を定数から `(col, row) => CSSProperties` 関数へ変更し `gridColumn`/`gridRow` を明示指定（`AdjacentMoveLayer`/`GoalMarkerLayer` と同じ auto-placement 崩れ対策）
  - proto-02 の `Stage06` へ `registerCellVisibilityNode={(cell, el) => registerCellVisibilityNode(cell, 'floor', el)}` を配線
  - Playwright headless で床タイル（`#f1f5f9` 背景の div）の `display` を直接検査し、初期状態で視界内 4 セルのみ `block`・残り 21 セルが `none` になることを確認、console error なし
- 2026-09-14: 「視界内に入ったら到達扱いにする」制御を追加。従来は `markVisited` が現在地セル自身のみを到達済みへ追加していたが、現在地の視界（8近傍、`visibleAreaOf`）全体を到達済みへ追加するよう変更。一度でも視界に入ったセルは、以後現在地の視界から外れても到達済み表示ON（既定）なら見え続ける。初期到達済みセルも `START_POSITION` 単体から `START_POSITION` の視界全体へ変更
  - Playwright headless で確認: 現在地を移動させ視界外になったセルが到達済み表示ONで表示継続 → OFFで非表示 → ONで再表示。現在地として一度も止まっていない（通り過ぎただけ視界に入った）セルも到達済みとして残ることを確認、console error なし

- 2026-09-14: 段階5の検討事項4件（108〜111行目、bot向き転換・歩行モーション・実行中ノンストップ・自動経路探索）の実装方針を設計レベルで検討（実装は未着手）
  - **bot を進行方向へ向ける**: box-bot-01 には yaw 回転を扱う `yawRef`（`BoxBotRefsProvider`）と `spin` action（`applyYawDelta` で増分加算のみ、絶対角度セット不可）が既存。進行方向を向けるには絶対角度セットの手段が要る。案: box-bot-01 に新規 action（例 `face`）を `defineAction` パターンで追加し、`use` 内で `yawRef.current` を直接書換える。瞬時切替か `useFrame` でイージングするか（`spin` の加減速ロジックが参考）は要検討。呼び出し元は各 proto の move hook（`useFindPathTick`/`useAdjacentMove`/`useHexMove`）側で移動元→移動先の (dx, dy) から方向を算出し、box-bot-01 の `useBoxBotActionDispatcher` 経由で dispatch する形になる想定。3 proto（tick 方式・隣接逐次・hex）すべてに配線が要る
  - **進行時に歩くモーションを再生する**: 訂正（2026-09-15、`face` action 実装時に判明）: box-bot-01 には `walking`/`marching` action が既に実装済み（`BOX_BOT_ACTIONS` に含まれる。46 行目の「未実装」記述は誤り、いつの間にか移植されていた）。残る論点は歩行中判定の区間（ON/OFF の切替タイミング）のみ。moveActor 呼出しは DOM 直書きで瞬時、見た目の移動補間は `actors-layer` の CSS `transition` が担っている（tick 方式は `TICK_MS` 間隔、逐次方式はクリック単位）ため、walking ON を moveActor 呼出し直後に dispatch し、OFF を CSS transition 終了検知（`transitionend` 購読）または移動アニメーション時間ぶんの `setTimeout` で行う案が考えられる
  - **実行中ノンストップ・介入時停止**: 現状 `isRunning`（`useFindPathTick`）中はセル選択・「1 手戻す」自体が disabled（`ActionBar`/`PlannedPathLayer`）のため、tick ループ自体は rxjs `timer` で既に途切れず走っている（「ノンストップ」は事実上達成済み）。この検討事項の本質は「実行中でも操作介入を受け付け、介入があった瞬間だけ停止する」という挙動変更（現行の全面 disabled 方針からの転換）を指すと判断。実現には isRunning 中のセル選択 disabled を解除し、介入検知時に `subscriptionRef.current?.unsubscribe()` を呼ぶ配線が要る。UX として「介入 = 何の操作を指すか」（セル追加のみ？「1 手戻す」も？）の定義から要検討
  - **自動経路探索（目的地クリック）**: 旧世代 stage-04 に BFS 実装済み（[stage-04-pathfinding/design.md](../_closed/20260716-stage-04-pathfinding/design.md)、単一 actor 前提）。移植時の分岐は proto 方式の違いに依存
    - proto-01（tick 方式、経路積み UI あり）: BFS 結果セル列をそのまま `planned-path` store へ push すればよく、既存の「経路積み→実行」フローにそのまま乗る。実装コスト低め
    - proto-02（隣接逐次移動）/proto-03（hex）: tick ループを持たないため、BFS 結果を 1 手ずつ順に `moveActor` へ渡す駆動機構が別途要る（`setTimeout` 連鎖、または `useFindPathTick` の簡易版を新設）
    - 視界制限（`VisibilityRegistryProvider`）採用時、自動生成経路が不可視セルを通過してよいかは要検討（106 行目の「視界内に入ったら到達扱い」ロジックとの整合）
- 2026-09-15: 「bot を進行方向へ向ける」を proto-03（hex）のみ実装。対象範囲・回転方式（瞬時切替 or イージング）はユーザー判断で「proto-03 のみ」「瞬時切替」に決定
  - box-bot-01 に新規 `face` action を追加（`_actions/face/`）。`spin` と異なり `useFrame` は使わず、`ACTION_FACE` 受信時に 1 回だけ `applyYawDelta(正規化した差分)` を呼び瞬時に向きを切替える。絶対角度セット用の adapter API は追加せず、既存の `readFacing()`(現在の実効向き) と `applyYawDelta`(増分加算) の組合せで実現した
  - `box-bot-01/index.tsx` に `jumpAction` と同じパターンで `ACTION_FACE`/`faceAction` を再 export（外部から `eventTarget` 共有 + `useBoxBotActionDispatcher` で発火する用途）
  - hex 6 方向（`HEX_DIRECTIONS`）→ 画面角度(rad、atan2 基準) の変換 `hexDirectionToScreenAngle` を `stage-07/_lib/hex.ts` に追加。`hex-layout.ts` の `axialToPixel` と同じ投影式（画面座標の `atan2(dy, dx)`）を hexSize=1 で複製して使用（`hex-layout.ts` への import は sibling 循環になるため）
  - `useHexMove` に `onFacingChange?: (screenAngle: number) => void` を追加。box-bot-01 の型（`faceAction`/`useBoxBotActionDispatcher`）を直接知らない疎結合のまま、算出した画面角度を呼び出し元へ渡すだけにした（stage-06 `ActorsLayer` が `actions` prop を外から受ける設計と同じ考え方）。box-bot-01 との実結合（`useBoxBotActionDispatcher` の生成・dispatch）は `Stage07` 側に閉じた
  - `Stage07` で `eventTarget` を `useState` lazy initializer で生成（`BoxBotEventProvider` と同じ手法）し、`ActorsLayer`（`actions=[faceAction]` 固定）と `useHexMove` の両方へ配線
- 2026-09-15: 上記実装のバグをユーザー指摘で発覚・修正。「(0,0)から右下(1,0)をクリックすると下を向く」（期待は右下方向）
  - 原因調査のため `_actions/face/index.stories.tsx` を新規追加（0〜330° 12方向のボタンで `face` を dispatch、正式な story として今後も残す）し、Storybook + Playwright で box-bot-01 単体の yaw と見た目の対応を実機確認。判明した事実: yaw=0(カメラ正面、`rotationY` の基準)は画面上「手前(観察者向き)」に見え、画面座標の `atan2` 基準(0=右方向)とは 90° ズレていた
  - 当初、単純に `atan2 結果 - 90°` のオフセット補正を試したが、box-bot-01 のカメラが斜め上から見下ろす遠近視点（`CAMERA_POSITION=[3.6,2.2,5.4]`、`ORBIT_TARGET=[0,0.32,0]`）のため、yaw 回転と画面上の見た目角度の関係は非線形（正面/背面付近で急激に変化し、側面付近ではほぼ変化しない）と判明。単純オフセットでは「右下」が実際にはほぼ側面向きに寄ってしまう不具合が残った。対応方針をユーザーに確認し「正確な投影計算で数値的に補正」を選択
  - box-bot-01 に `_lib/camera.ts`（`CAMERA_POSITION`/`ORBIT_TARGET` を `index.tsx` から切り出し、両ファイルが参照）と `_lib/screen-facing.ts`（`screenAngleToYaw`）を新設。カメラの right/up ベクトルへ正面ベクトル `(sinθ,0,cosθ)` を投影し画面角度を求める `yawToScreenAngle` を内部に持ち、目的の画面角度に対し 0.5°(720分割)刻みで yaw 全域を走査し最も近い yaw を返す数値逆算（解析的な逆関数は非線形性のため導出できないため）。`screenAngleToYaw` を `index.tsx` から再 export
  - 責務を再整理: `hex.ts` の関数は `hexDirectionToScreenAngle`（画面角度計算のみ、box-bot-01 非依存）に改称・簡素化。yaw への変換（`screenAngleToYaw`）は box-bot-01 のカメラモデルを知る `Stage07` 側で行うよう統一（`useHexMove`/`hex.ts` は一貫して box-bot-01 非依存を維持）
  - Storybook + Playwright headless で再確認: 「右下」（screenAngle 30°）で正面と側面の中間の自然な斜め向き、「真下」（screenAngle 90°）で完全な正面向きになることを確認
  - Storybook + Playwright headless で 3 方向移動（右 → 右上 → 下）を実施、都度スクリーンショットで向きが変化することを目視確認。console error なし
- 2026-09-15: 「進行時に歩くモーションを再生する」を proto-03（hex）のみ実装。対象範囲はユーザー判断で「proto-03 のみ」に決定（face と同様）
  - box-bot-01 の既存 `walkingAction`/`ACTION_WALKING`（脚の前後スイング on/off トグル、`BOX_BOT_ACTIONS` に元々収録済みだが外部非公開だった）を `face`/`jump` と同じパターンで `box-bot-01/index.tsx` から再 export。`Stage07` の `ActorsLayer` の `actions` に `walkingAction` を追加
  - walking はトグル方式（1 回の dispatch で on/off 反転）のため、on/off 状態を `Stage07` 側の `isWalkingRef` で追跡。ON: `useHexMove` の `onCellChange`（セル移動確定時）で `isWalkingRef.current` が false のときのみ dispatch → true にする。OFF: `ActorsLayer` の位置決め div（`left`/`top`/`transform` を 150ms transition させている要素）に新設した `onArrived`（`transitionend` の `propertyName === 'left'` のみ拾う）で `isWalkingRef.current` が true のときのみ dispatch → false にする
  - この方式により、連続移動中（次の移動が前の移動の transition 完了前に来る）は ON を維持し続け、移動が完全に止まった（transitionend が発火した）ときのみ OFF になる（ユーザー選択の「moveActor 直前で ON、常時 ON のまま次 moveActor が来れば継続」を実現）
  - Storybook + Playwright headless で確認: ブラウザ内タイマーで 50ms 間隔の連続 3 回移動を発火 → walking dispatch が ON 1 回 / OFF 1 回のみ（最後の移動の transition 完了時に OFF）であることを console.log 一時追加で確認。スクリーンショットで移動中は脚が前後に開いた歩行姿勢、停止後は直立姿勢に戻ることを目視確認。console error なし
- 2026-09-15: 歩行に腕の振りを追加(ユーザー追加依頼)。box-bot-01 には転倒(fall)用の `applyArmAngle`(両腕同角度、直立中は書込まない)はあったが、歩行の自然な腕振り(左右逆位相)には使えないため新設が必要だった
  - `BoxBotActionHost` に `applyArmSwing({ left, right })` を新設(`applyLegSwing` と同型、adapter が左右の腕グループの `rotation.x` へ反映)。fall の `applyArmAngle` と書込先(同じ `rotation.x`)は共有するが、fall は直立中(`phaseRef===0`)は早期 return して書かないため排他的に動作し競合しない
  - `walkingAction` の `WalkingConfig` に `armSwingAngle`(既定 0.35、脚の `swingAngle`=0.5 よりやや控えめ)を追加。`useWalking` で脚と同じ位相・速度をもとに、反対側の脚と同位相(左腕 = 右脚、右腕 = 左脚)で腕角を計算し `applyArmSwing` へ渡す。停止時の 0 への戻し(`approach`)・早期 return 条件(両脚・両腕が戻りきったか)も脚と同様に腕を含めて判定
  - Storybook + Playwright headless で確認: 連続移動中に左右の腕が交互に前後する見た目をスクリーンショットで確認(拡大クリップで目視)。console error なし

## 懸念・リスク

- ~~stage-04（画面座標 absolute）と box-bot（three.js Canvas）のレイヤ統合方式が未確定~~ → box-bot-01（表示領域 = 設置領域）採用で解消。Canvas が `cellSize` に収まり、samples 版の一回り大きい Canvas 起因の occlude / クリック奪取は単体では出ない
- time-control-03 の store 数が多い。ページ 1 枚に持ち込む際の Context ネスト規模
- 遠近は CSS `perspective` + `rotateX` で確定（stage-05）。actor は逆 `rotateX` 立て直し済み。遠近に伴うセルのクリック判定の歪み補正のみ未対応
- 段階 2 で box-bot 搭載済。残課題（stage-05 README「未対応」に詳細）: (1) 複数 actor の z 順 / occlude、(2) 遠近に伴うセルのクリック判定歪み。tilt 位置ズレは解決（`resize={{ offsetSize: true }}`）
- **ゲーム操作で React 再レンダリングを起こさない方針**（上記決定事項）。actor 移動が state 更新のため未達。段階 3 で position/move を ref ベースへ寄せる際に対応
- 段階 5「戻る」のインセンティブ設計（ギミック・退避行動等）は具体案が未確立。今後の検討課題
- 段階 5 経路選択を隣接マスのみに制限する場合の境界処理・視覚化（点線表示等）の具体的な実装方式は未検討
- （将来検討）グリッド（正方形マス）からヘクス（六角形マス）表示への変更。今回はスコープ外、着手時期未定
- React DevTools Profiler で「実行完了時、通常は無関係なはずの子要素（`Stage06`/`ActorsLayer` 等）が再レンダリング対象に巻き込まれる」挙動を確認。bisect の結果、原因は 76ed2fe（`isRunning` 導入、`useFindPathTick` の呼び出し元を `ActionBar` から親 `FindPathContent` へ移したコミット）と特定（`console.log` での実測で確認。当初立てていた「zustand state 更新と React useState 更新が 2 段階レンダリングになっている」仮説は誤りで、`setPlannedPath([])` と `setIsRunning(false)` は同一バッチで 1 回のレンダリングにまとまっていた）。`FindPathContent` が `isRunning` を保持しているため、実行開始・完了のたびに配下ツリー全体（`Stage06` 含む）が再レンダリングされる。**ゲーム操作で React 再レンダリングを起こさない方針**（前述の決定事項）に反するが、`ActorsLayer` 自体は position を ref 管理しているため実害は限定的と見られる。`isRunning` を Context 化するなど再レンダリング範囲を絞る対応は後日検討
- 2026-09-14: 上記「実行完了時に子セル全部が再レンダリングされる」件、「重複選択の表示対応（order 単位化、5c674b1）あたりで発生し始めたのでは」との疑いを受け再 bisect。`PlannedPathLayer` の各セル生成箇所に `console.log` を仕込み、コミットごとに `git checkout <hash> -- <files>` でファイルのみ切り替えて実測。64645d0（isRunning 導入前）は 25 回（セル数ぶん 1 回）、76ed2fe（isRunning 導入）で 50 回（2 回）に増加、5c674b1（重複表示対応）でも変わらず 50 回。よって原因は従来の特定どおり 76ed2fe のみで、重複表示対応は無関係と確認できた
- 2026-09-14: 隣接マス制限の実装に着手するにあたり、9/14 の「重複選択禁止を最終方針とする」決定（103 行目）を再検討。隣接マス限定移動では「同じセルへ戻って通る」動線（例: 1→2→1→3、障害物回避等）が正当な経路として発生しうるため、重複選択を一律禁止する方針は隣接制限と相性が悪いと判断。**新規に `proto-02` を新設**し、比較試作として別方式（`planned-path` 積み上げ→まとめて「実行」ではなく、隣接セルをクリックするたびに 1 手ずつ即時移動する逐次型）を実装。この方式では「重複選択」という概念自体が発生しない（積み上げが無いため）。あわせて、移動前に確認ダイアログを挟むかを切り替えるチェックボックスを追加し、event 駆動（セルクリック → 隣接判定 → 確認要否分岐 → `moveActor` 実行）で構成した。proto-01（積み上げ→実行方式）はそのまま維持し、2 方式を比較したうえで段階 5 の採用方針を決定する運びとする
  - `_hooks/use-adjacent-move.ts`: `currentCell`(state) を軸に `isAdjacent`（上下左右のみ、斜め不可）で判定。`moveActor` は stage-06 `ActorNodeRegistryProvider` の ref ベース実装をそのまま流用（DOM 直書き、アニメーションは `ActorsLayer` の CSS transition）
  - `_components/adjacent-move-layer/`: 隣接セルのみ点線枠で選択可能を明示。非隣接セルは `disabled` でクリック自体無効
  - time-control-03 の store 群・tick ループ（game-clock / path / planned-path / rxjs）は proto-02 に持ち込まない。逐次移動はクリック単位の離散更新のため、tick 駆動のアニメーション基盤が不要
  - Storybook `Default` story で動作確認（Playwright headless、`scratch/verify.mjs` 一時検証、確認後削除）。隣接判定・移動後の選択可能セル切替・「戻る」動線・確認ダイアログ表示、いずれも想定通り
- 2026-09-14: proto-02 の `useAdjacentMove` を `useState` 全撤去（`currentCell`/`confirmRequired`/`reachedGoal` を全て ref 化）してリファクタ。移動のたびに `Stage06` 配下全体が再レンダリングされていた問題を解消
  - 実装中、選択可能セルの `disabled` 属性を DOM 直書きで切り替える（React の `disabled` prop で初期化した後に外側から `node.disabled = false` する）方式が、以後そのセルのクリックを一切 React 側へ届かなくする不具合を確認。Playwright headless で `elementFromPoint` によるヒットテスト・DOM 上の `disabled`/border 状態はいずれも正しいにも関わらず、合成クリックイベントが React の `onClick` へ到達しなくなる事象（ネイティブ `.click()` / `dispatchEvent` / Playwright locator click いずれも同様に失効。原因は未特定だが、React が `disabled` prop 由来の DOM 属性について合成イベント発火可否をネイティブ DOM の現在値でなく内部トラッキングで判定している可能性を疑っている）
  - 対応として `disabled` 属性自体を使うのをやめ、選択不可の判定を `handleCellClick` 内の `isAdjacent` ガードへ一本化（`AdjacentMoveLayer` の button は常時 non-disabled、見た目の点線枠のみ DOM 直書きで切替）。この方式なら再現しないことを確認済み
