# prettier

<https://prettier.io/>

## 概要

Markdown 専用の formatter として継続使用。コード側(`.ts`/`.tsx`/`.js`/`.jsx`/`.cjs`/`.mjs` 等)は [oxfmt](../oxfmt/README.md) へ移行済み。

## Markdown を Prettier に残した理由

oxfmt は Markdown 内の TypeScript コードフェンスを、言語の構文を理解せず一般整形しており、意味を変える破壊が確認された(ジェネリクスの末尾カンマ `<T,>` の削除等)。詳細は [oxfmt README](../oxfmt/README.md) の「Markdown を除外した理由」を参照。

- `.oxfmtrc.json` の `ignorePatterns` に `*.md` を追加し、Markdown は oxfmt の対象から除外している。
- ESLint 側の `plugin:prettier/recommended`(`prettier/prettier` ルール)はコード側のフォーマットチェックに使われており、oxfmt 出力と `.prettierrc.cjs` の設定が一致する限り機能する(469/470 ファイルで出力が一致することを確認済み)。

## 設定

`.prettierrc.cjs` / `.prettierignore` を継続使用。VSCode 側は `.vscode/settings.json` の `[markdown]` スコープでのみ `esbenp.prettier-vscode` をデフォルトフォーマッタに指定している。
