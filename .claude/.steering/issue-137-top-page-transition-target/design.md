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
- [ ] 経路選択を隣接マスのみに制限。選択可能マスは点線等の見た目に変更し選択可能な状態を明示する
- [ ] 到達済みマスのみ「表示」する（他マスは黒塗り or 非表示、表現方法は検討）。現状はゴール含め全マスが常時可視
- [ ] 「1 手戻す」（計画上の消費取消）と「戻る」（到達済みマスへ消費を伴い異動する行動）を別枠の操作として分離検討。「戻る」は一見メリットのない行動のため、ギミックによるインセンティブ付与・退避行動としての活用など仕組みの導入を検討
- [ ] 障害物 / 歩数制限 / 一方通行セル（段階 4 から継続。「挑戦」「工夫」実現の中心方針）
- [ ] （検討）bot を進行方向へ向ける
- [ ] （検討）進行時に歩くモーションを再生する
- [ ] （検討）「実行」中は停止を挟まず歩く速度を維持する。途中の操作介入があった時点で停止する

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

## 懸念・リスク

- ~~stage-04（画面座標 absolute）と box-bot（three.js Canvas）のレイヤ統合方式が未確定~~ → box-bot-01（表示領域 = 設置領域）採用で解消。Canvas が `cellSize` に収まり、samples 版の一回り大きい Canvas 起因の occlude / クリック奪取は単体では出ない
- time-control-03 の store 数が多い。ページ 1 枚に持ち込む際の Context ネスト規模
- 遠近は CSS `perspective` + `rotateX` で確定（stage-05）。actor は逆 `rotateX` 立て直し済み。遠近に伴うセルのクリック判定の歪み補正のみ未対応
- 段階 2 で box-bot 搭載済。残課題（stage-05 README「未対応」に詳細）: (1) 複数 actor の z 順 / occlude、(2) 遠近に伴うセルのクリック判定歪み。tilt 位置ズレは解決（`resize={{ offsetSize: true }}`）
- **ゲーム操作で React 再レンダリングを起こさない方針**（上記決定事項）。actor 移動が state 更新のため未達。段階 3 で position/move を ref ベースへ寄せる際に対応
- 段階 5「戻る」のインセンティブ設計（ギミック・退避行動等）は具体案が未確立。今後の検討課題
- 段階 5 到達済みマスのみ表示にする場合、ゴール（旗マーカー）や現在地の可視性とのバランスは未検討
- 段階 5 経路選択を隣接マスのみに制限する場合の境界処理・視覚化（点線表示等）の具体的な実装方式は未検討
