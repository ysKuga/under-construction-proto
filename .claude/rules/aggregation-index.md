# 種類別ファイル 集約 index

ディレクトリ配下、対象ごとに種類別ファイル(`types.ts`/`constants.ts` 等)へ分離する構成の場合、種類ごとの集約 index へ re-export 追加する。

例: `_stores/actor-settings/types.ts` 追加時、`_stores/_types/index.ts` へ以下追加。

```ts
export * from '../actor-settings/types'
```

- 集約 index 名、`_<種類>/index.ts`(`_types/index.ts` `_constants/index.ts` 等)
- 対象 store・types 限定せず。他ディレクトリ構成・他種類ファイル分離時も同パターン踏襲
- 種類別ファイル未導入の対象は、対応する集約 index 自体 作成不要
