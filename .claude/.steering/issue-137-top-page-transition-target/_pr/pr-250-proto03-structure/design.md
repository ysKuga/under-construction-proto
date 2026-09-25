# proto-03 の構造見直し

issue: #137 / PR: #250（PR-1）（backlog「proto-03 の構造見直し」）

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
- `currentCell` → stage-07 の actors store（`actors[PLAYER_ACTOR_ID]`）を読む
  - `Stage07` が移動成立時に更新しており、ページ側の `useState` は重複保持だったため
- `displayMode`/`enableWalking` → `_stores/display-settings`（新設）
  - `MoveTargetDisplayMode` は store の `types.ts` へ移す。store から layer への逆依存を避けるため
- `goalReached` → `_stores/goal`（新設）

### content 分割（PR-3）

- `_contents/stage`: `Stage07` + 各レイヤー、移動・経路・中継点の操作
  - 操作ごとの処理は `_hooks/` へ部品 hook として分ける（`index.tsx`/`index.hooks.ts`/`index.types.ts` 構成）
  - EN は残量の有無（boolean）のみ購読する。残量の増減ではステージを再レンダリングしない
- `_contents/bot-bubbles`: bot 頭上の吹き出し（中継点・実行）
- `_contents/control-panel`: 表示設定の切替・EN・リセット・ゴール到達・中継点選択状況
  - EN 残量の表示はここでのみ購読する
- content 間で共有するもの
  - 提示中の経路: `_hooks/use-preview-path.ts`（stage の表示と「実行」の双方が使う）
  - `Stage07Handle` の ref: `_contexts/stage07-handle` で配布（stage が `ref` へ渡し、「実行」が `followPath` を命令する）
    - r3f-state ルールの複数消費者と同じ方式
- 独立 bot・見出し・`EnergyDebugPanel` は数行のため Content に残す
