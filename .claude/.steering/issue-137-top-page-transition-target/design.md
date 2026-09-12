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

## 懸念・リスク

- ~~stage-04（画面座標 absolute）と box-bot（three.js Canvas）のレイヤ統合方式が未確定~~ → box-bot-01（表示領域 = 設置領域）採用で解消。Canvas が `cellSize` に収まり、samples 版の一回り大きい Canvas 起因の occlude / クリック奪取は単体では出ない
- time-control-03 の store 数が多い。ページ 1 枚に持ち込む際の Context ネスト規模
- 遠近は CSS `perspective` + `rotateX` で確定（stage-05）。actor は逆 `rotateX` 立て直し済み。遠近に伴うセルのクリック判定の歪み補正のみ未対応
- 段階 2 で box-bot 搭載済。残課題（stage-05 README「未対応」に詳細）: (1) 複数 actor の z 順 / occlude、(2) 遠近に伴うセルのクリック判定歪み。tilt 位置ズレは解決（`resize={{ offsetSize: true }}`）
- **ゲーム操作で React 再レンダリングを起こさない方針**（上記決定事項）。actor 移動が state 更新のため未達。段階 3 で position/move を ref ベースへ寄せる際に対応
- 「ジャンプ → 歩く」（proto-01）は実行前アンロックとして前段に置く方針だが、grid 移動の操作系との配線は未整理
