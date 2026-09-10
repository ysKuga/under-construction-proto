# 段階 3: time-control 適用（tick 統合 + 再レンダリング回避）

親: [issue-137-top-page-transition-target/design.md](../../design.md) 段階 3

issue: #137（段階 3 着手にあたり reopen）
PR: #142

## 目的

stage-05 / find-path 試作へ time-control-03 の tick 管理を統合する。bot の move を `MoveIntent` 即時反映から tick 駆動へ移す。合わせて「ゲーム操作で React 再レンダリングを起こさない方針」（親 design.md 決定事項 2026-09-07）を実装する。

## 背景・制約

- 親 design.md 段階 1・2 完了（PR #140, #141）。ページ枠は試作 `src/components/pages/find-path/_prototypes/proto-01/`（stage-05 マウントのみ）で先行、route/page は段階 3 まで組んでから
- prototype は若いバージョンからの import 許容（`src/prototypes/README.md`）。pages 配下でも同様

### stage-05 現状

- actor position は stage-04 の `ActorPositionProvider` が state 管理。move は `MoveIntent` dispatch → `resolveMoveIntent` で即時反映、tick 非経由
- `_components/actors-layer` は position state を購読 → actor 移動で再レンダリング、同居する静的 bot も巻き込む
- `_components/geo-layer` / `_components/actors-layer` は grid 座標系依存で stage-05 新規。`ActorPositionProvider` / keyboard hook は stage-04 から import 共有
- 傾き制御 `_hooks/use-perspective-control` は ref 経由（`--floor-tilt` 直接書換え、再レンダリングなし）

### time-control-03 現状

- `TimeControl03Providers` = props → `StoresProvider`（7 store: game-clock / actor / actor-settings / path / planned-path / position / intent）→ `ComputedProvider` → `ScopeEventProvider` のネスト
- store 生成順は依存順（position は actor/actor-settings/path/game-clock 依存、intent はさらに planned-path/position 依存）
- `_events/_event-listeners/`: dispatch-target / set-fixed-path-steps / set-time-scale / toggle-progress-mode 等
- `_computed/` computed layer、`_components/`: action-bar / schedule-preview / stage-view / actor-controller / action-log-panel
- 構成: 複数 actor へ `set target`（企図）のみ → `ActionBar` で全 actor 一括「行動決定」（実行）→ 履歴パネル

### find-path 試作の要件差分

- time-control-03 = 複数 actor / actor 毎に target 指定 / 一括実行
- find-path = 単一 bot / `planned-path` を先に順次積む / 「実行」で tick 進行、1 手ずつ歩く
- → intent / planned-path の使い方が異なる。store 流用範囲の仕分けが要る

## 検討事項（このサブ steering で詰める）

### 1. store 群の持ち込み単位

#### 前提: 2 つの座標系・MoveIntent が別物

| 観点 | stage-04/05 `ActorPositionProvider` | time-control-03 |
| --- | --- | --- |
| 座標 | `GridPosition {col,row}` 整数・clamp あり | `Position {x,y}` 自由座標・制限なし |
| MoveIntent | `{source, target}`（source = actor-click / cell-click / keyboard） | `{actorId, target}` |
| 反映 | `resolveMoveIntent` で clamp → 即 `setState` | `generateMovePath` で距離刻み経路生成 → path / planned-path 書込 → position store が tick 消化 |
| actor 数 | 単一（Provider 1 個 = 1 actor、id なし） | 複数（全 state が `xxxById: Record<ActorId, _>`） |

find-path はグリッドセル単位・単一 bot。tc-03 は連続座標・複数 actor。モデルが根本的に違う。

#### 7 store の find-path 要否

- **game-clock** — 要。`timeScale`（早送り / ポーズ）・`commonGameTimeMs`（tick 時刻）・`eventLog` / `getHistory`（履歴）。座標系非依存、ほぼそのまま流用可
- **planned-path** — 要。経路積み UI の対象そのもの。ただし現状 `setPlannedPath` は丸ごと差し替え → find-path は「セルを 1 つずつ push」主体なので `appendPlannedStep` 相当の action 追加が要る
- **path** — 要。実行時の「残り経路」。planned-path のコピーを積み position store が 1 step ずつ消化
- **position** — tick 消化ロジック（`applyNextStep` / auto の `continueAuto` timeScale accumulator / `dispatchAction`=manual 1 手 / `dispatchActions`=batch）は移植価値大。ただし `positionById` が state → 段階 3 の再レンダリング回避の主対象。**ここを ref / r3f `useFrame` 反映へ改造必須**（検討事項 2 と一体）
- **actor** — `{speed, tickRate}`。`tickRate`（tick 間隔）は要。`speed` は連続座標の `stepDistance = speed * tickMs` 用 → セル単位の find-path では不要。tickRate だけで足りる
- **actor-settings** — `progressMode`（auto / manual）は「実行 = 最後まで自動」vs「1 手ずつ」に流用可。`fixedPathSteps` / `isFixedPathSteps` は planned-path の長さがそのまま step 数の find-path では不要。All 系 action（複数 actor 一括）も不要
- **intent** — `dispatchMoveIntent` が `generateMovePath`（距離ベース刻み）で経路生成。find-path は planned-path が既にセル列 → 経路生成そのものが不要。**この store は使わない**。代わりに「セルクリック → planned-path へ push」の別 action（stage-04 の MoveIntent 系に近い形）

依存: position ← actor / actor-settings / path / game-clock、intent ← それら + planned-path / position。intent を外せば position は 4 store 依存で残る。

#### 持ち込み方式の選択肢

- **A: `TimeControl03Providers` 丸ごと流用**（7 store + computed + events、`_components` のみ自前）
  - ○ 最速、prototype の若バージョン import 許容方針に沿う
  - × intent（距離ベース経路生成）・複数 actor 前提の All 系・fixedPathSteps 等 find-path 不要機能を抱える。position の再レンダリング問題も丸ごと持ち込み → 結局改造が要る
- **B: find-path 用 Provider を新規に組む**（必要 store 抜粋 + position 作り直し + intent 差し替え）
  - ○ セル単位・単一 bot のモデルに合う。再レンダリング方針を最初から織り込める
  - × 工数大。stage-06 新設とセットになりやすい（検討事項 4）
- **C: 中間** — game-clock / planned-path / path / actor / actor-settings は tc-03 から import 流用、position と intent だけ find-path 用に差し替え

#### 結論（暫定）: C を軸

- game-clock / planned-path / path は座標系非依存（`Position {x,y}` に `x=col, y=row` でセル座標を載せれば store 改変なしで流用可）→ そのまま import
- position・intent は find-path のセル単位モデル + 再レンダリング回避で作り直しが妥当 → 差し替え
- actor / actor-settings は「tickRate だけ」「progressMode だけ」の縮小利用 → import 流用で一部 action のみ使うか、find-path 用に薄く作り直すか要判断
- planned-path に `appendPlannedStep`（末尾 push）と `popPlannedStep`（取り消し）相当を足す
- 座標系ブリッジ: tc 側 store を使うなら `{x: col, y: row}` で載せるのが素直（store 無改変）。stage-05 の `GridPosition` との相互変換は薄い helper 1 個で
- `_components`（action-bar / schedule-preview 等）は流用せず find-path 用に自前。`_computed` は要否を検討事項 3 で確認

### 2. position を state から ref へ（結論: ref-based Provider へ置換）

#### 重要な前提

`BoxBot01` は自前で `<Canvas>`（r3f ルート）を持つが、**グリッド上の bot 位置は three.js 内部ではなく外側 DOM ラッパーの CSS `left` / `top`**（stage-05 `actors-layer` の `cellStyle`）。box-bot-01 自身の `useFrame` アクション（jump 等）も `displayAreaRef.current.style.top` を書換える DOM 操作。

→ グリッド位置の ref 化に r3f `useFrame` は不要。`usePerspectiveControl` が `--floor-tilt` を書換えるのと同じ要領で、**bot ラッパー DOM の `left` / `top`（%）を直接書換える**。セル間の補間は既存の CSS `transition: left/top 150ms` が担う。滑らか補間（useFrame ベース）は将来。

#### 設計

- `ActorPositionProvider`（stage-04, `useState`）は使わず、**ref ベースの新 Provider `actor-node-registry` へ置換**。stage-04 は無改変（stage-05 が引き続き使う）
- Provider が公開する API:
  - `registerActorNode(id, el)` — bot ラッパー DOM を id で登録（`ref` コールバック）
  - `moveActor(id, target)` — 登録ノードの `style.left/top` を clamp 済み % で直接書込み。`setState` なし → 再レンダリングなし
  - `getActorPosition(id)` — ref 保持の現在セルを返す（read。初期配置・keyboard の相対移動が参照）
  - `gridSize`
- cell クリック / keyboard / actor クリック順送り / tick move すべて `moveActor` を呼ぶ
- 複数 actor: `Map<id, HTMLElement>` + `Map<id, GridPosition>` の registry（`.claude/rules/react/r3f-state.md`「複数消費者 → Context 配布」＝ box-bot-model の `BoxBotRefsProvider` パターン）
- Provider value は `useMemo` で固定（state を持たないため Provider 自体が再レンダリングしない）
- keyboard hook は stage-06 用に新規（stage-04 版は `useActorPosition` を購読して再レンダリングするため流用不可）。registry の `getActorPosition`（ref read）→ `moveActor` で組む
- bot ラッパー: `BoxBot01` は `ref` 非対応 → 位置決め用の `<div>` で 1 枚くるみ、その div に `cellStyle`（absolute + 逆 rotateX + transition）と `ref` を付ける（#108 の Canvas サイズ論点とは無関係、単なる配置 div）

### 3. tick 接続（結論: position 相当の tick ループを移植、`_computed` / `_events` は段階 3 では見送り）

- **`game-clock` 自体は tick ドライバを持たない** — `advanceTickMs` 付きで event を log するだけ。tc-03 の実ドライバは **position store の `startAutoIfNeeded` → `continueAuto`（`setTimeout` ループ、`timeScale` を都度読む fixed-step accumulator）**
- 「tick 接続」＝ この `continueAuto` ループを find-path 用 position 差し替えへ移植する。ループが呼ぶ `applyNextStep` の 3 処理: (a) `game-clock` へ log、(b) `path` を pop、(c) position 反映。**find-path では (c) が `moveActor(id, cell)`（ref 経由、再レンダリングなし）**
- 「実行」ボタン: `dispatchAction`（manual = 1 tick）/ `dispatchActions`（auto = 最後まで）を **store から直呼び**。EventTarget 経由（proto-01 パターン）は段階 4 のアンロック配線とまとめて検討
- `_computed`: `stageTransform`（全 actor bounding box fit）と `progressMode` 代表値のみ。find-path MVP は stage 固定・単一 bot なので **不要**。段階 4 以降で必要になれば追加
- `_events/_event-listeners`: 段階 3 では見送り。「実行」は store 直呼び
- time-scale スライダー → `game-clock.setTimeScale`（そのまま流用）

### 4. stage-05 拡張 vs stage-06 新設（結論: stage-06 新設）

- position の ref 化＝`ActorPositionProvider`（stage-04）置換。`actors-layer` / `geo-layer` の配線も変わる。差分が大きい
- stage-05 は「即時移動 + 遠近」の参照実装として残す
- **stage-06 = 遠近（stage-05 の `usePerspectiveControl` を import 流用、`floorStyle` / scene 構成はコピー）+ ref position + tick**
- プロジェクトの stage-01〜05 ＝各バージョンというパターンに沿う
- find-path proto-01 のマウント先を stage-05 → stage-06 へ差し替え（PR-D）

### 5. issue の扱い（決定済）

- issue #137 を reopen。ブランチ `137-time-control-integration`、PR #142

## PR 分割案

段階 3 を 1 PR にせず分割する。各 PR は #137 紐づけ、ブランチ `137-xxx`。

- **PR #142（このブランチ）**: 設計のみ（design.md / review-points.md）。実装なし。先行マージ可
- **PR-A `137-stage-06-ref-position`（PR #143, draft・作成済）**: stage-06 スキャフォールド + ref position
  - `src/prototypes/stage/stage-06/` 新設。遠近は stage-05 から流用
  - `_contexts/actor-node-registry/`（ref ベース Provider）新規
  - `_hooks/use-keyboard-move.ts`（registry 版）新規
  - `_components/geo-layer` / `actors-layer` を registry 版で
  - tick なし。cell クリック / keyboard / actor クリックで即 `moveActor`
  - `console.log('render: ...')` マーカーで「移動時に再レンダリングなし」を Storybook 確認
- **PR-B `137-find-path-time-control-stores`**: time-control store 持ち込み（C 方式）
  - `game-clock` / `planned-path` / `path` を tc-03 から import する find-path 用 Provider
  - `planned-path` へ `appendPlannedStep` / `popPlannedStep` 追加（tc-03 側 store 拡張 or find-path 用 wrapper、要判断）
  - tick は走らせない。store 配線と型のみ
  - **配置先確定**: find-path proto 配下 `src/components/pages/find-path/_prototypes/proto-01/_contexts/find-path-stores/`。stage-06 は grid + 遠近 + actor 位置 ref に専念し、time-control 合流はページ試作側で持つ（stage prototype から time-control-03 を import しない）
  - **append/pop 確定**: find-path 側 wrapper hook `_hooks/use-planned-path-steps.ts`。tc-03 の planned-path store は無改変 import（`usePlannedPathStoreApi` 経由で `getPlannedPath` + `setPlannedPath` を組み合わせ）。セル座標は `Position` へ `{x: col, y: row}` で載せ、`GridPosition` 相互変換は薄い helper
  - PR-D で proto のマウント先を stage-05 → stage-06 に切替えるまで、本 PR の Provider は stage-05 マウントの proto-01 を包むだけ（stage 側は store 未使用）
**着手順を D → C に入れ替え**（2026-09-10）。PR-C の tick ドライバは `path` / `game-clock` store（proto 側 `FindPathStoresProvider` 配下）と `moveActor`（stage-06 `actor-node-registry`）の両方を読むため proto 側に置くしかなく、proto が stage-06 をマウント済みであることが前提。stage-06 は time-control-03 を import しない方針のため tick を stage-06 内には置けない。

- **PR-D `137-find-path-stage-06-switch`**: find-path proto を stage-06 へ切替（先行）
  - proto-01 のマウント先を `Stage05` → `Stage06`（props シグネチャ同一）
  - 即時移動・移動で再レンダリングなしを Storybook 確認
- **PR-C `137-find-path-tick-execution`**: tick ドライバ移植 + 「実行」
  - `continueAuto` 相当を find-path 用 position へ移植、(c) を stage-06 の `moveActor` へ。tick ドライバは proto 側（`_hooks/`）に置く
  - **移植と同時に rxjs 化する**（`timer` + `withLatestFrom(timeScale$)` + `scan` + `takeWhile`）。検討は `.claude/.steering/issue-131-rxjs-adoption/design.md` 候補 A 参照。r3f `useFrame`（実時間）と tick（論理時間）の境界を明記する
  - 「実行」ボタン・time-scale スライダーは find-path proto の `_components/` に自前（stage-06 は store 非依存のまま）
  - 「実行」ボタンで planned-path → path → tick 進行 → bot が 1 手ずつ
  - time-scale スライダー（`timeScale` を `BehaviorSubject` 化）

## 実装計画

- [x] 検討事項 1（store 持ち込み単位）→ 結論（暫定）C: game-clock / planned-path / path は import 流用、position / intent は差し替え
- [x] 検討事項 2（position の ref 化）→ ref ベース Provider `actor-node-registry` へ置換。DOM `left/top` 直書き、useFrame 不要
- [x] 検討事項 3（tick 接続）→ position の `continueAuto` ループを移植、(c) を `moveActor` へ。`_computed` / `_events` は段階 3 見送り
- [x] 検討事項 4（stage 拡張 vs 新設）→ stage-06 新設
- [x] PR-A: stage-06 スキャフォールド + ref position（PR #143 マージ済。`src/prototypes/stage/stage-06/`、`_contexts/actor-node-registry/`）
- [x] PR-B: time-control store 持ち込み（C 方式）— PR #151 マージ済。`FindPathStoresProvider`（proto 配下）+ `usePlannedPathSteps` wrapper hook
- [~] PR-D: find-path proto を stage-06 へ切替 — 着手（D → C に順序入れ替え）
- [ ] PR-C: tick ドライバ移植 + 「実行」
- [x] 空 PR 先行作成 (#142) → 番号確保 → 本ディレクトリを `_pr/pr-142-time-control-integration/` へ配置

## 決定事項

- 2026-09-08: 段階 3 は着手確定として検討段階 (`YYYYMMDD-slug`) を挟まず、空 PR #142 先行作成 → `_pr/pr-142-time-control-integration/` で起票（`.claude/rules/steering.md` issue 直結配下サブ作業の着手確定パス）。issue #137 を reopen
- 2026-09-08: 段階 3 を PR-A〜D の 4 本に分割（stage-06 スキャフォールド / store 持ち込み / tick 実行 / proto 切替）
- 2026-09-08: position の ref 化は r3f `useFrame` でなく **bot ラッパー DOM の `left/top` 直書き**で行う（グリッド位置は three.js 内部でなく CSS のため）。`usePerspectiveControl` の `--floor-tilt` 直書きと同方式
- 2026-09-08: stage-06 を新設。stage-05 は即時移動版の参照として残す。stage-06 は遠近を stage-05 から流用し ref position + tick を載せる
- 2026-09-08: `_computed` / `_events`（tc-03）は段階 3 では持ち込まない。「実行」は store 直呼び
- 2026-09-09: PR-C の tick ドライバ移植は rxjs 化とセットで行う（`continueAuto` → `timer` + operator 合成）。rxjs 適用の全体検討は `.claude/.steering/issue-131-rxjs-adoption/design.md`（issue #131 reopen）
- 2026-09-10: PR-B の store Provider 配置先を find-path proto 配下（`_contexts/find-path-stores/`）に確定。stage-06 は time-control-03 を import しない（stage / time-control の合流はページ試作側）。`appendPlannedStep` / `popPlannedStep` は find-path 側 wrapper hook（`_hooks/use-planned-path-steps.ts`）で実装し、tc-03 の planned-path store は無改変 import
- 2026-09-10: PR-B マージ済（PR #151）。着手順を D → C に入れ替え。PR-C の tick ドライバは proto 側の store（`path` / `game-clock`）と stage-06 の `moveActor` の両 Context 配下に置く必要があり、proto が stage-06 をマウント済みなのが前提。よって PR-D（マウント切替、即時移動のまま）を先行させる

## 懸念・リスク

- ~~time-control-03 の store 数が多い。find-path 要件に対し過剰~~ → 検討事項 1 で C 方式へ整理。intent は不使用、actor / actor-settings は縮小利用
- ~~position の ref 化で stage-04 の `ActorPositionProvider` / keyboard hook 共有が崩れる~~ → stage-06 新設で stage-04/05 は無改変。stage-06 用の registry Provider / keyboard hook を新規作成
- `moveActor` が DOM `left/top` を直書きする一方、`actors-layer` の初期 `cellStyle` も React inline style で `left/top` を持つ。stage-06 が何かの拍子に再レンダリングすると初期値へ戻る（`usePerspectiveControl` の `--floor-tilt` と同じ既知の割り切り。stage-06 は state を持たせない設計で回避）
- ~~`planned-path` への `appendPlannedStep` 追加を tc-03 側 store に入れるか find-path 側 wrapper に閉じるか未決（PR-B で判断）~~ → find-path 側 wrapper hook に確定（2026-09-10）。tc-03 store は無改変
- 「ジャンプ → 歩く解放」（proto-01）を実行前アンロックとして前段に置く方針だが、grid 移動の操作系との配線は段階 4 で未整理のまま
