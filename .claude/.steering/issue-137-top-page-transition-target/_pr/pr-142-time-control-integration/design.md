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

- `TimeControl03Providers` を丸ごと import するか、必要 store だけ抜粋して find-path 用 Provider を組むか
- `_components` は流用せず store / `_events` / `_computed` のみ載せる想定
- 7 store のうち find-path で不要なもの（async-sample は既に除外済、actor-settings / 複数 actor 前提の intent の扱い）を確定
- Context ネスト規模（親 design.md 懸念）

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

### 5. issue の扱い

- issue #137 は CLOSED。段階 3 の実装コミット前に reopen するか新 issue 起票するかをユーザーへ確認（`.claude/rules/issue-linking.md`）

## 実装計画（検討後に確定）

- [ ] 検討事項 1〜4 を詰めて方式決定、この design.md へ追記
- [ ] store 群の持ち込み（find-path 用 Provider or time-control-03 Providers 流用）
- [ ] position の ref 化（再レンダリング回避、Context 配布）
- [ ] tick ↔ bot move の配線
- [ ] find-path 試作へ反映、Storybook で確認
- [x] 空 PR 先行作成 (#142) → 番号確保 → 本ディレクトリを `_pr/pr-142-time-control-integration/` へ配置

## 決定事項

- 2026-09-08: 段階 3 は着手確定として検討段階 (`YYYYMMDD-slug`) を挟まず、空 PR #142 先行作成 → `_pr/pr-142-time-control-integration/` で起票（`.claude/rules/steering.md` issue 直結配下サブ作業の着手確定パス）。issue #137 を reopen

## 懸念・リスク

- time-control-03 の store 数が多い。find-path の単一 bot / planned-path 積み要件に対し過剰な可能性 → 抜粋 Provider の是非
- position の ref 化で stage-04 由来の `ActorPositionProvider` / keyboard hook 共有が崩れる。stage-04 側へ影響を出さない切り出し方
- 「ジャンプ → 歩く解放」（proto-01）を実行前アンロックとして前段に置く方針だが、grid 移動の操作系との配線は段階 4 で未整理のまま
