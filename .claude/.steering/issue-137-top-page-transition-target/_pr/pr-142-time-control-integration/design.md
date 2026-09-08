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

### 2. position を state から ref へ

- `ActorPositionProvider`（stage-04）依存を切るか置換するか
- box-bot-01 は r3f Canvas → `useFrame` 内で `.current` 反映（`.claude/rules/react/r3f-state.md`、box-bot-model の `BoxBotRefsProvider` / `useBoxBotRefs` 例）
- 複数消費者（cell クリック / keyboard / tick move）から同一 ref 参照 → Context 配布
- tick ごとの目標セル → 補間移動 or 即時ワープ（初期は即時で可）

### 3. tick 接続

- time-control-03 の `game-clock` tick へ bot move を乗せる配線ポイント
- `_events/_event-listeners` のどれを流用するか（dispatch-target / set-fixed-path-steps 等）
- time-scale / progress-mode を早送り・巻戻し UI へ流用（親 design.md ゲーム内容）

### 4. stage-05 を拡張するか stage-06 新設か

- 段階 1・2 と同様 prototype 空間で進める
- time-control 統合で構造が大きく変わるなら stage-06 新設を検討（stage-05 は actor 即時移動版として残す）

### 5. issue の扱い（決定済）

- issue #137 を reopen。ブランチ `137-time-control-integration`、PR #142

## 実装計画（検討後に確定）

- [x] 検討事項 1（store 持ち込み単位）を詰める → 結論（暫定）C: game-clock / planned-path / path は import 流用、position / intent は差し替え
- [ ] 検討事項 2〜4 を詰めて方式確定
- [ ] store 群の持ち込み（C 方式: 抜粋 import + position / intent 差し替え）
- [ ] position の ref 化（再レンダリング回避、Context 配布）
- [ ] tick ↔ bot move の配線
- [ ] find-path 試作へ反映、Storybook で確認
- [x] 空 PR 先行作成 (#142) → 番号確保 → 本ディレクトリを `_pr/pr-142-time-control-integration/` へ配置

## 決定事項

- 2026-09-08: 段階 3 は着手確定として検討段階 (`YYYYMMDD-slug`) を挟まず、空 PR #142 先行作成 → `_pr/pr-142-time-control-integration/` で起票（`.claude/rules/steering.md` issue 直結配下サブ作業の着手確定パス）。issue #137 を reopen

## 懸念・リスク

- ~~time-control-03 の store 数が多い。find-path 要件に対し過剰~~ → 検討事項 1 で C 方式（抜粋 import + position / intent 差し替え）へ整理。intent は不使用、actor / actor-settings は縮小利用
- position の ref 化で stage-04 由来の `ActorPositionProvider` / keyboard hook 共有が崩れる。stage-04 側へ影響を出さない切り出し方
- 「ジャンプ → 歩く解放」（proto-01）を実行前アンロックとして前段に置く方針だが、grid 移動の操作系との配線は段階 4 で未整理のまま
