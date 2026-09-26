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

### FindPathProto03Contents（PR-4）

`FindPathProto03Content`（`index.tsx`）は content を組み合わせるだけになったが、以下が残っていた。

- 独立 bot の props・サイズ定数（`STANDALONE_BOT_SIZE`）
- レイアウト用の className（全体の縦並び、stage と独立 bot の横並び）
- `onReset` の props 受け渡し（`FindPathProto03` の `resetKey` 更新）

#### 方針

- `FindPathProto03Contents` へ名前変更し、`_contents/index.tsx` へ移動する
  - 各要素を並べるのみとし、props・定数・className を持たない
- `_contents/` = その階層の直下で使う実装の置き場
  - `_contents/title`: 見出し（`h1`）
  - `_contents/stage-area`: stage と独立 bot を横に並べる
    - `stage-area/_contents/stage`: 既存 `_contents/stage` をネスト（`stage-area` からのみ使うため）
    - `stage-area/_contents/standalone-bot`: 独立 bot（issue #248 の状態同期で実装が増える見込みのため切り出す）
  - `_contents/bot-bubbles`・`_contents/control-panel`: 既存のまま
  - `EnergyDebugPanel`: find-path 共有の `_components` のため `_contents` へは入れず直接使う
- `onReset` を context 化する
  - `_contexts/reset`: `resetKey` の state と `key` の付与を1つの Provider へまとめ、`reset` 関数を配る
  - `FindPathProto03` から `useState` がなくなる
  - Provider 群の中での位置は PR-5 で見直す

#### HTML セマンティクス

ディレクトリ名（`_contents`）はコード上の置き場の区分で、HTML 要素の選択とは別に扱う。

- `<main>` は `pages/layout.tsx` が提供済み。Contents のルートは `div`
- `article`（単独で配信・再利用できる自己完結コンテンツ向け）はステージ・操作パネルに合わない
- 候補: 見出しは `header` + `h1`、`stage-area`・`control-panel` は `aria-label` 付き `section`
