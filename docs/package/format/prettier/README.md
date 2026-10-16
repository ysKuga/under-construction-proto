# prettier

<https://prettier.io/>

## 概要

formatter としては使用していない。コード・Markdown とも [oxfmt](../oxfmt/README.md) へ移行済み(Markdown は 2026-10-16 移行)。

ESLint 側の `plugin:prettier/recommended`(`prettier/prettier` ルール)の依存として残している。

- コード側のフォーマットチェックに使われ、oxfmt 出力と `.prettierrc.cjs` の設定が一致する限り機能する(469/470 ファイルで出力が一致することを確認済み)。

## 設定

`.prettierrc.cjs` / `.prettierignore` を ESLint 用に継続使用。VSCode のデフォルトフォーマッタには指定していない。
