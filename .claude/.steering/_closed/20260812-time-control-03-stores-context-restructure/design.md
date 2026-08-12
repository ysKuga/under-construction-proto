# time-control-03 stores/context 実装構成見直し

## 目的

- `_stores/` と `_contexts/` に分散している store 実装・context 実装を、store 単位のディレクトリにまとめる
- store 用 context の共通生成関数を導入し、重複している定型コードを削減する
- `_stores` 内の store 間依存を、実装 (`store.ts`) ではなく型・定数のみに限定し、循環 import の余地を無くす

## 背景・制約

- 旧構成:
  - `_stores/*.ts`: `create-xxx-store` (zustand vanilla store 生成関数) + `XxxState`/`XxxStore` 型
  - `_contexts/*-store-context.tsx`: 対応する `XxxStoreContext` (React Context) + `useXxxStore` (selector hook)
  - `_contexts/stores-provider.tsx`: 全 store を生成し、対応する Context.Provider をネストして配布する集約 provider
  - `_contexts/stage-transform-context.tsx`: store に依存しない、計算値 (stage transform) を配布するだけの context (共通化対象外)
- 対象 store は7つ: `game-clock` / `actor` / `actor-settings` / `path` / `planned-path` / `position` / `intent`
  - 依存関係: `position` は `actor`/`actor-settings`/`path`/`game-clock` に依存、`intent` はさらに `planned-path`/`position` にも依存
- 旧 `*-store-context.tsx` の実装パターン比較:
  - 基本形 (`actor-settings`/`actor`/`intent`/`path`/`planned-path` の5つ): `createContext<Store | null>(null)` → `useContext` → `null` なら throw → `useStore(store, selector)` という完全同型の実装
  - `game-clock-store-context.tsx`: 基本形 + `useGameClockStore` に `equalityFn` 引数を追加
  - `position-store-context.tsx`: `usePositionStore` (selector 版) と生 store をそのまま返す `usePositionStoreApi` (ref 経由の直接購読向け) の2つを export
- `src/prototypes/CLAUDE.md` のバージョン間依存ルール (`time-control-01 → 02 → 03` の一方向 import) は今回のディレクトリ再編でも維持 (逆依存の混入なし、確認済み)

## 決定事項

- 新ディレクトリ命名は既存の `_stores`/`_contexts`/`_components`/`_lib` の慣習 (アンダースコア prefix = Next.js private folder 規約) を踏襲し、`_stores/<name>/` とする
- `_contexts/` は非 store 系 context (`stage-transform-context.tsx`) と、全 store を集約する `stores-provider.tsx` の置き場として存続
- 共通 context 生成関数 `createStoreContext` は prototype 内ではなく `src/stores/utils/create-store-context.ts` に配置 (店固有ではない汎用実装のため昇格)
  - シグネチャ: `createStoreContext<State>(storeName: string)` → `{ StoreContext, useStoreApi, useStoreSelector }`
  - `storeName` (例 `'ActorSettings'`) からエラーメッセージ用の hook 名・Context 名を動的生成
  - `equalityFn` は `useStoreSelector` の optional 第2引数として標準搭載、`game-clock` 以外は単に渡さないだけで対応
  - `position` の `usePositionStoreApi` (生 store 版) は `useStoreApi` を context.tsx 側で追加 export する形で対応
- 各 store 配下、型・定数を `types.ts`/`constants.ts` に分離 (定数を持たない store は `constants.ts` 自体作らない)
- 種類別ファイル (`types.ts`/`constants.ts`) の集約 index `_stores/_types/index.ts`・`_stores/_constants/index.ts` を新設
  - 汎用ルールとして `.claude/rules/aggregation-index.md` に切り出し、`CLAUDE.md` から読込む形にした
  - store が増える・型/定数分離が進むたびに集約 index への re-export を追加していく運用
- 各 store の `index.ts` は実装 (`store.ts`) と hook/context (`context.tsx`) のみ re-export。`types.ts`/`constants.ts` は re-export しない
  - 理由: re-export すると型・定数の取得経路が「集約 index」と「対象自身の index.ts (実装も引き連れる)」の2通り生まれ、後者を誤って通ると実装依存の混入・循環 import の余地が生じるため
- 参照経路ルール (確定):
  - 対象内部 (`store.ts`/`context.tsx`): `./types` `./constants` 直接
  - 他 store (`position/store.ts` 等): `_types`/`_constants` 集約 index 経由
  - component・`_lib` 等の外部消費者: 種類別ファイルへ直接 (`_stores/actor-settings/constants` 等、集約 index は経由しない)
- ESLint (`import/no-restricted-paths`) によるルール機構化は今回は見送り。上記ルールは規約 (CLAUDE.md/rules) 運用のみで担保する

## 実装計画 (完了)

- [x] store 単位ディレクトリへの再編 (`game-clock`/`actor`/`actor-settings`/`path`/`planned-path`/`position`/`intent` 全7 store)
  - 各 store とも「新設 (`_types`/`_constants` 反映含む) → 参照元切替 → 旧ファイル削除」の3コミットで実施
- [x] store 用 context 共通生成関数 (`src/stores/utils/create-store-context.ts`) の実装・適用
- [x] `equalityFn`・`usePositionStoreApi` の差異吸収
- [x] 各 store の型・定数分離 (`types.ts`/`constants.ts`) と `_types`/`_constants` 集約 index の整備
- [x] 各 store `index.ts` から types/constants の re-export を除去、参照経路ルールの確立
- [x] `stores-provider.tsx` は `_contexts/` に残置 (対応済み)
- [ ] ESLint 依存ルール整備 — 見送り (規約運用のみ、上記「決定事項」参照)
- [x] 全 import 元 (`_components/*`・`_lib/*`・`__tests__/*` 等) の参照パス更新、型チェック・lint・既存テスト (`__tests__/`) 通過確認

## 将来検討

今回 PR 対象外の項目は `20260812-time-control-03-stores-context-followups/design.md` へ移行済み。

## 懸念・リスク

- `intent` store は他 store から型参照されないが、一貫性のため `_types` へは登録済み (未使用 re-export として残る)
