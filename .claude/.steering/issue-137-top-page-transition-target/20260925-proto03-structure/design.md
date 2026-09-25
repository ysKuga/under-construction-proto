# proto-03 の構造見直し

issue: #137（backlog「proto-03 の構造見直し」）

## 目的

- `_components/` を部品のみの置き場にする
- `FindPathProto03Content`（`proto-03/index.tsx`、826行）の肥大化を解消する
- 整理した構成を pages 全体の方針として `src/components/pages/CLAUDE.md` へ記載する

## 背景・制約

- `_components/` に `*-layer`（Stage07 の children として重ねるレイヤー）と部品が混在している
  - layer: `goal-marker` `item` `move-target` `objective-marker` `obstacle` `one-way` `path-preview` `waypoint-select`
  - 部品: `bot-bubble` `execute-bubble` `waypoint-bubble` `waypoint-selecting-indicator`
- `FindPathProto03Content` が全 state・handler・JSX を保持している
  - state: `currentCell` `displayMode` `enableWalking` `goalReached` `objectiveCell` `waypointFlowState` `waypoints`
  - `waypointFlowState`/`waypoints`/`objectiveCell` は stage・吹き出し・操作パネルの3箇所から参照される
  - props のまま `_contents/` へ分割しても Content に state が残り、肥大化が半分しか解消しない
- 挙動は変えない（全 PR `refactor`/`docs`）

実装計画: [backlog.md](backlog.md)

## 方針

### ディレクトリ

- `_components/`: 部品のみ
- `_layers/`: Stage07 の children として重ねるレイヤー
- `_contents/`: ページのコンテンツを区画ごとに格納。`FindPathProto03Content` は組み合わせるのみ
- 命名は既存の `_components`/`_stores` 等と同じ複数形

### 依存方向

`_contents` → `_layers` → `_components`（逆方向の参照は禁止）

- `_stores`/`_lib`/`_hooks`/`_events`/`_contexts` はいずれの層からも参照可

### 共有 state の store 化

複数 content から参照される state は zustand store へ移し、selector 購読にする（[game-state](../../../../rules/react/game-state.md)）。

- `waypointFlowState`/`waypoints`/`objectiveCell` → `_stores/waypoint-flow`（新設）
- `currentCell`/`goalReached`/表示設定（`displayMode`/`enableWalking`）→ 置き場は PR-2 内で決める
