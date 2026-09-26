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
- いったん導入しない。行う場合は各 content でなく layout 側（`pages/layout.tsx` 等）での対応を検討する

### Provider 構成（PR-5）

PR-4（#253）の上に作業する。

#### 現状

`FindPathProto03`（`proto-03/index.tsx`）は Provider 群の配置のみを担う。
Provider が 13 段ネストしている（外側から順に）。

- `ResetProvider`（`_contexts/reset`）: 配下へ `key` を付け、`reset` で丸ごと再マウントする
- `EnergyStoreProvider`（find-path 共有 `_stores/energy`）: EN store。内側で EN のイベント機構・listener も配線する
- `FindPathEventProvider`（`_events`）: find-path の EventTarget。EN 判定の listener が energy store を参照するため `EnergyStoreProvider` の内側
- `ItemStoreProvider`（`_stores/items`）: `initialItems`（`INITIAL_ITEMS`、`index.tsx` で組み立て）を受ける
- `ActorsStoreProvider`（stage-07）: `initialActors`（player の `START_POSITION`）を受ける
- `Stage07EventProvider`（stage-07）: stage-07 の EventTarget
- `FogStoreProvider`（`_stores/fog`）: `initialMode`（`FindPathProto03` の props `initialFogMode`）を受ける
- `VisibilityRegistryProvider`（`_contexts/visibility-registry`）: fog store を購読するため `FogStoreProvider` の内側
- `FollowPathStoreProvider`・`WaypointFlowStoreProvider`・`DisplaySettingsStoreProvider`・`GoalStoreProvider`（`_stores/*`）: 相互依存なし
- `Stage07HandleProvider`（`_contexts/stage07-handle`）: `Stage07Handle` の ref

`index.tsx` には Provider の初期値（`INITIAL_ITEMS`）の組み立ても残っている。

#### 方針

- Provider 群を `FindPathProto03Providers` としてまとめ、`index.providers.tsx` へ移す
  - `FindPathProto03` は `FindPathProto03Providers` と `FindPathProto03Contents` を組み合わせるのみにする
  - Provider に関する JSDoc（`VisibilityRegistryProvider`・`ActorsStoreProvider`・リセット）は `FindPathProto03Providers` へ移す
- Provider の初期値は `FindPathProto03Providers` 側へ集約する
  - `INITIAL_ITEMS`: `index.providers.tsx` のモジュール定数
  - `initialFogMode` の既定値（`'all-hidden'`）
- `FindPathProto03Props` は `index.types.ts` へ移す
  - `index.tsx`・`index.providers.tsx` の双方から参照するため（相互 import を避ける）
  - `FindPathProto03ProvidersProps = PropsWithChildren<FindPathProto03Props>` とし、`{...props}` で渡す

```tsx
const FindPathProto03 = (props: FindPathProto03Props) => (
  <FindPathProto03Providers {...props}>
    <FindPathProto03Contents />
  </FindPathProto03Providers>
)
```

#### 決定事項

- 置き場は `_providers/` でなく `index.providers.tsx`
  - 前例: time-control-03 の `index.providers.tsx`（`TimeControl03Providers`）
  - `_contents/` は配下に子の実装（`title`・`stage-area` 等）を持つためディレクトリにした。Provider は各実装が `_stores`/`_contexts` に既にあり組み合わせるのみで、`_providers/` にしても `index.tsx` 1枚になる
  - `_contexts/` = 個別 Context の実装、`index.providers.tsx` = それらの組み合わせ、と役割が分かれる
- ネストは平坦化しない（`composeProviders` 的な utility は作らない）
  - Provider ごとに props（`initialItems`/`initialActors`/`initialMode`）が異なり、配列合成では型・可読性が落ちる
  - ネストは `index.providers.tsx` へ移すことで `index.tsx` からは見えなくなる
- 並び順の制約は `FindPathProto03Providers` の JSDoc に明記する（time-control-03 と同形式）
  - `FindPathEventProvider` は `EnergyStoreProvider` の内側（listener が `useEnergyStoreApi` を参照）
  - `VisibilityRegistryProvider` は `FogStoreProvider` の内側（`useFogStoreApi` を参照）
  - 上記以外は相互依存なし。store 系・stage-07 系等の中間 Provider へのグループ化は段が増えるだけのため行わない
- `ResetProvider` は最外のまま、全 Provider をリセット対象とする現状を維持する
  - 表示設定・霧のモードも PR-2 以前（`useState` 時代）からリセットで初期値へ戻っていた
  - リセット対象から外すのは挙動変更のため、本 PR（`refactor`）の対象外。必要になれば別途 backlog へ積む

### pages 全体の方針（PR-6）

PR-5（#254）の上に作業する。
PR-1〜5 で整理した構成を `src/components/pages/CLAUDE.md` へ pages 全体の方針として記載する。

#### 既存記述との比較

- `_components` のネスト（[component-nesting](../../../../rules/react/component-nesting.md)）
  - 「特定の親からのみ使う子は親配下の `_components/` へ」という基準
  - `_contents` のネスト（`stage-area/_contents/stage`）は同じ基準の適用で、矛盾しない
  - ルール側は `_components` のみを対象に書かれているため、pages/CLAUDE.md で `_contents`・`_layers` にも適用すると明記する
- 構成分割（[react/hooks.md](../../../../rules/react/hooks.md) の `index.tsx`/`index.hooks.ts`/`index.types.ts`）
  - `index.providers.tsx` は同じ「種類ごとの `index.*` 分割」の延長にあたる
  - 前例の time-control-03 は `src/prototypes/` 配下で、pages 限定の構成ではない
  - hooks.md は hook の分割ルールのため、Provider の組み合わせはそこへ足さず pages/CLAUDE.md に書く
- 同列 import の回避（[sibling-import](../../../../rules/sibling-import.md)）
  - 依存方向 `_contents` → `_layers` → `_components` は「一方向にする」の具体化で、矛盾しない
- home の `_prototypes/CLAUDE.md`
  - `_components/` を「共通の実装置き場」（`bot-overlay` 等の部品）としており、`_components` = 部品の定義と一致する
- find-path の `_prototypes/CLAUDE.md`（proto-03）
  - `_contents` の定義・依存方向を proto-03 の説明として記載済み。pages/CLAUDE.md への一般化に合わせ、一般論は参照へ置き換える
  - PR-5 前の記述が残っている
    - 「`index.tsx` は Provider 群の配置のみ」→ `index.providers.tsx` の `FindPathProto03Providers`
    - EN の「`EnergyStoreContext.Provider` を `index.tsx` の `FindPathProto03` 直下」→ `FindPathProto03Providers` 内の `EnergyStoreProvider`
- `_contents/index.tsx` の JSDoc
  - 「Provider 群（`FindPathProto03`）の内側で使う」→ `FindPathProto03Providers`

#### 方針

- pages/CLAUDE.md に記載する内容
  - `_components`/`_layers`/`_contents` の役割
  - 依存方向（`_contents` → `_layers` → `_components`）
  - `_contents` のネスト（component-nesting と同じ基準）
  - `index.tsx`（組み合わせのみ）・`index.providers.tsx`（Provider の組み合わせ）・`_contexts/`（個別 Context）の役割分担
  - ディレクトリ名と HTML 要素の選択は別に扱う
- 例は proto-03 を参照させる。pages 配下で上記構成を採るのは現状 proto-03 のみのため、既存ページへの一括適用は行わない
- 上記の古い記述（`_prototypes/CLAUDE.md`・`_contents/index.tsx`）を合わせて修正する
