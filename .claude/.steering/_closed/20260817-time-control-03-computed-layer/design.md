# time-control-03-computed-layer

## 目的

component が扱う入力を props/store/computed の3層に分離する設計を確立する。time-control-03 に `_computed` を新設し (`progressMode` の算出集約)、そこで得られた設計判断を docs/concept に一般化して記録し、他プロトタイプでも再利用できるようにする。

## 背景・制約

- props (`TimeControl03Props`, `createPropsContext`) / store (`_stores`, `createStoreContext`) は既に確立済み。今回 computed という3層目を新設する。
- 具体例: `progressMode` (全 actor 代表値)。元は `action-bar/index.hooks.ts` 内で `actor-settings-store` から直接算出していたが、「全 actor 代表値で決める、という判断自体は TimeControl03 スコープの話」であり `ActionBar` 固有の関心ごとではないため `_computed` に切り出した。
- `_events` (event-driven-decoupling 由来) の自己完結モジュール構成 (`index.ts`/`index.contexts.tsx`/`types.ts` + 集約 index 経由参照ルール) を `_computed` にも踏襲する。
- `_computed → _stores` の一方向依存とし、`ComputedProvider` は `StoresProvider` の内側に配置する制約がある (依存元 store の Context を参照するため)。

## 実装計画

- [x] `_computed/types.ts` — `ComputedState`/`ComputedStore` 型定義
- [x] `_computed/store.ts` — `createComputedStore` (zustand vanilla store。依存元 store の `subscribe` で変化時のみ再算出)
- [x] `_computed/index.contexts.tsx` — `ComputedProvider`/`useTimeControl03Computed`
- [x] `_computed/index.ts` — 集約 index
- [x] `_stores/actor-settings/context.tsx` に `useActorSettingsStoreApi` を追加 (`createStoreContext` の `useStoreApi` を computed 向けに新規 export)
- [x] `index.providers.tsx` に `ComputedProvider` を `StoresProvider` の内側・`ScopeEventProvider` の外側に配置
- [x] `_components/action-bar/index.hooks.ts` の `progressMode` 算出を `_computed` 経由に置換
- [x] `_computed/README.md` 新設 (構成・依存関係・参照ルール・追加手順)
- [x] `_computed/README.md` に「関連」節を追加、docs/concept 新設ページへ逆リンク
- [x] `docs/concept/component-input-layers/README.md` 新設 (props/store/computed 3層分離の一般化)
- [x] `docs/concept/README.md` に新設ページへのリンク追加
- [x] `_components` 配下から computed 候補を洗い出し (`stage-transform-context.tsx` を発見)
- [x] `_contexts/stage-transform-context.tsx` (`StageTransformProvider`/`useStageTransform`) を `_computed` の `stageTransform` へ吸収、`_contexts/` ディレクトリごと削除
- [x] `_stores/planned-path/context.tsx` に `usePlannedPathStoreApi` を追加

## 決定事項

- **computed も Context ではなく zustand store で実装した**。理由は re-render 最小化。Context value に生値を乗せると Provider 配下全体が再レンダリング対象になるため、`_stores` と同じ「Context には store instance を乗せ、`useStoreSelector` (selector 購読) で subscribe する」パターンを踏襲した。`useTimeControl03Computed(state => state.progressMode)` により、実際に `progressMode` を参照する component のみが再レンダリング対象になる。
- **命名を `useTimeControl03Props`/`useActorSettingsStore` と揃え `useTimeControl03Computed` にした**。3層すべてで「誰が (scope)」「何を (props/store/computed)」扱うか一目で分かる対称性を優先した。
- **`useActorSettingsStoreApi` を新規 export した理由**: computed 側は selector 購読ではなく生 store の `subscribe` + `getState()` で自前の再算出タイミングを制御する必要があるため、`createStoreContext` が既に持っていた `useStoreApi` を `_stores/actor-settings/context.tsx` 側で追加 export した (position-store 同様、必要になった store から順次追加する運用)。
- **`_computed` は `_events` と同じ自己完結モジュール型を踏襲**。外部消費者 (`action-bar` 等) は集約 index (`_computed`) 経由で参照する。
- **`ComputedProvider` は `StoresProvider` の内側に配置**。`_stores` の Context を参照する必要があるため。`_computed → _stores` の一方向依存になり、`_stores` 側は `_computed` を一切知らない (`_events` と同型)。
- **`stage-transform-context.tsx` (`StageTransformProvider`) を `_computed` の `stageTransform` へ統合した**。既存実装は「全 actor の目標地点から算出した transform を Context 配布する」という progressMode と同型の computed パターンを、`_computed` 新設以前に個別実装していたもの。`StageView` 固有の局所 Provider だったが、`StageView` は TimeControl03 で常に表示されるため独立スコープを維持する実益が薄く、`_computed` の集約点に統合した。
- **`stageTransform` の再算出は `plannedPathStore` の `subscribe` + `zustand/shallow` 比較**。元実装 (`useShallow` + `useMemo`) と同じく「targets (各 actor の目標地点) が実際に変化した時のみ再計算」という性質を維持する必要があったため、targets の shallow 比較を挟んでから `computeFitTransform` を呼ぶ構成にした (progressMode の `!==` 比較では対応できない、targets が配列のため)。
- **`useStageTransform` という個別 hook 名は廃止し、呼び出し側で `useTimeControl03Computed((state) => state.stageTransform)` に統一した**。`_stores` 各 store の selector 購読 (`usePositionStore((state) => state.getPosition(id))` 等) と同じ直接呼び出し形式に揃え、`_computed` 経由の値取得手段を1つに保つため。

## 懸念・リスク

- computed 層を安易に増やすと、「store にロジックを書くべきか computed に切り出すべきか」の判断基準が曖昧になり得る。docs 側で使い分け基準を明文化する必要がある。
- 依存元 store が増えるほど `ComputedProvider` 内で `useXxxStoreApi` を都度取得する構造になり、依存元の多いプロトタイプでは Provider 実装が肥大化する懸念がある。
- `_computed/store.ts` の再算出比較ロジック (`!==` か `shallow` か) は依存元の値の形に応じて個別実装している。computed 値が増えるほど比較ロジックの重複が増える可能性がある。
