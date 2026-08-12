# 種類別ファイル 集約 index

ディレクトリ配下、対象ごとに種類別ファイル(`types.ts`/`constants.ts` 等)へ分離する構成の場合、種類ごとの集約 index へ re-export 追加する。

例: `_stores/actor-settings/types.ts` 追加時、`_stores/_types/index.ts` へ以下追加。

```ts
export * from '../actor-settings/types'
```

- 集約 index 名、`_<種類>/index.ts`(`_types/index.ts` `_constants/index.ts` 等)
- 対象 store・types 限定せず。他ディレクトリ構成・他種類ファイル分離時も同パターン踏襲
- 種類別ファイル未導入の対象は、対応する集約 index 自体 作成不要

## 対象自身の index.ts では種類別ファイルを re-export しない

`_stores/actor-settings/index.ts` 等、対象自身の index.ts は実装(`store.ts`)・hook/context(`context.tsx`)のみ集約する。`types.ts`/`constants.ts` は re-export しない。

理由: re-export すると、型・定数を取得する経路が「種類別 集約 index (`_types`/`_constants`)」と「対象自身の index.ts (実装も引き連れる)」の2通り生まれる。他対象からの参照が誤って後者を通ると、実装への依存が紛れ込み、循環 import の余地が生じる。

参照経路:

- 対象内部(`store.ts`/`context.tsx` 等): `./types` `./constants` 直接
- 他対象(他 store の `store.ts` 等): 種類ごとの集約 index (`_types`/`_constants`) 経由
- 対象の外部消費者(component・`_lib` 等、対象間の相互依存回避が目的外の参照元): 種類別ファイルへ直接(`_stores/actor-settings/constants` 等)。集約 index 経由にしない
