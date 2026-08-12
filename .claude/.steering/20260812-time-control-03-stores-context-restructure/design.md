# time-control-03 stores/context 実装構成見直し

## 目的

- `_stores/` と `_contexts/` に分散している store 実装・context 実装を、store 単位のディレクトリにまとめる
- store 用 context の共通生成関数を導入し、重複している定型コードを削減する
- `_stores` ⇔ `_contexts` 間の依存方向を ESLint で明示的に制約する

## 背景・制約

- 現状構成:
  - `_stores/*.ts`: `create-xxx-store` (zustand vanilla store 生成関数) + `XxxState`/`XxxStore` 型
  - `_contexts/*-store-context.tsx`: 対応する `XxxStoreContext` (React Context) + `useXxxStore` (selector hook)
  - `_contexts/stores-provider.tsx`: 全 store を生成し、対応する Context.Provider をネストして配布する集約 provider
  - `_contexts/stage-transform-context.tsx`: store に依存しない、計算値 (stage transform) を配布するだけの context (共通化対象外)
- 対象 store は7つ: `game-clock` / `actor` / `actor-settings` / `path` / `planned-path` / `position` / `intent`
  - 依存関係 (`stores-provider.tsx` の生成順から): `position` は `actor`/`actor-settings`/`path`/`game-clock` に依存、`intent` はさらに `planned-path`/`position` にも依存
- 各 `*-store-context.tsx` の実装パターン比較:
  - 基本形 (`actor-settings`/`actor`/`intent`/`path`/`planned-path` の5つ): `createContext<Store | null>(null)` → `useContext` → `null` なら throw → `useStore(store, selector)` という完全同型の実装
  - `game-clock-store-context.tsx`: 基本形 + `useGameClockStore` に `equalityFn` 引数を追加
  - `position-store-context.tsx`: context 取得部分を内部関数 `usePositionStoreContext` に切り出し、`useStore` で包む `usePositionStore` (selector 版) と生 store をそのまま返す `usePositionStoreApi` (ref 経由の直接購読向け) の2つを export
- ESLint (`.eslintrc.cjs`) は `import/no-restricted-paths` で `src/features` 間の依存を既に制御している。`_stores`/`_contexts` 間には同種のルールが未設定
- `src/prototypes/CLAUDE.md` のバージョン間依存ルール (`time-control-01 → 02 → 03` の一方向 import) は今回のディレクトリ再編でも維持する

## 決定事項

- 新ディレクトリ命名は既存の `_stores`/`_contexts`/`_components`/`_lib` の慣習 (アンダースコア prefix = Next.js private folder 規約) を踏襲し、`_stores/<name>/` とする (`stores/<name>/` ではない)
- `_contexts/` は非 store 系 context 専用ディレクトリとして存続させる (`stage-transform-context.tsx` はここに残す)
  - `stores-provider.tsx` の移設要否は実装計画内で個別に検討する (store 集約役という点では store 側寄りだが、非 store 系 context 専用という方針とは矛盾しうる)

## 実装計画

- [ ] store 単位ディレクトリへの再編
  - [ ] `_stores/<name>/store.ts` (旧 `_stores/<name>-store.ts` の中身を移設)
  - [ ] `_stores/<name>/context.tsx` (旧 `_contexts/<name>-store-context.tsx` の中身を移設)
  - [ ] `_stores/<name>/index.ts` (store.ts・context.tsx の re-export)
  - [ ] 対象7 store (`game-clock`/`actor`/`actor-settings`/`path`/`planned-path`/`position`/`intent`) 分すべて実施
  - [ ] 旧 `_stores/*.ts` / `_contexts/*-store-context.tsx` の削除、全 import 元の参照更新
- [ ] store 用 context 共通生成関数の実装
  - [ ] 置き場所決定 (`_stores/_lib/create-store-context.ts` 想定。固まった後の共通置き場 `time-control/_lib/` への昇格は将来検討、`src/prototypes/CLAUDE.md` ルールに従う)
  - [ ] 基本形5 store をこの共通関数に置き換え
  - [ ] `game-clock` の `equalityFn` 引数差異の扱い決定 (共通関数の selector hook に元々 optional 引数として持たせ、基本形5 store は単に渡さないだけにするか要検討)
  - [ ] `position` の `useXxxStoreApi` (生 store 返却) 差異の扱い決定 (共通関数側で context 取得用の内部 hook も export し、必要な store のみ追加で使う形にするか要検討)
- [ ] `stores-provider.tsx` の配置先決定・実施 (`_contexts/` 存続 or `_stores/` 側へ移設)
- [ ] ESLint 依存ルール整備
  - [ ] `_stores/<name>/store.ts` から 他 store の `context.tsx` への import を禁止 (store 同士は `store.ts` 経由のみで依存させる)
  - [ ] `_contexts/` (非 store 系) から `_stores/*/store.ts` への直接 import を禁止し、`_stores/*/context.tsx` (または `index.ts`) 経由に限定
  - [ ] `import/no-restricted-paths` の `zones` に time-control-03 用エントリを追加
- [ ] 全 import 元 (`_components/*` 等) の参照パス更新、`yarn lint` / 既存テストで確認

## 懸念・リスク

- 共通生成関数のジェネリクス設計 (`State`/`Store` の型パラメータ、`equalityFn` optional 引数、エラーメッセージ内の hook 名文字列化) が複雑化しすぎないか要検証
- `position` のような「selector 版 + 生 store 版」の2 export パターンが今後増える場合、共通関数の API 拡張方針を先に決めておかないと再度ばらつく可能性
- ディレクトリ再編は import パスの変更範囲が広い (`_components/*` 含む) ため、一括置換後の型チェック・lint・既存テスト (`__tests__/`) 通過を必ず確認する
- `time-control-02` 以前のバージョンから `time-control-03` の store/context を import している箇所がないか事前確認要 (`src/prototypes/CLAUDE.md` の一方向依存ルール上、無いはずだが要確認)
