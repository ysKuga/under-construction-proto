# oxfmt

<https://oxc.rs/docs/guide/usage/formatter>

## 概要

oxc プロジェクト製 Rust 実装 formatter。`.oxfmtrc.json` で Prettier 設定を引き継いで採用。

- `--migrate=prettier` で `.prettierrc.cjs` から自動生成可能。
- コード(`.ts`/`.tsx`/`.js`/`.jsx`/`.cjs`/`.mjs` 等)のフォーマットに採用。**Markdown(`.md`)は対象外**、Prettier を継続使用。

## Markdown を除外した理由(重大バグ)

oxfmt は Markdown 内の TypeScript コードフェンスを、言語の構文を理解せず一般整形しており、意味を変える破壊が発生した。

- 例: ジェネリクスの末尾カンマ `<T,>`(`.tsx` で JSX タグと区別するための必須構文)が `<T>` に削除された(`.claude/rules/react/hooks.md` で発生)。
- 例: 複数行の `args: { /* ... */ }` が意図と異なる1行整形に変わった(`.claude/rules/react/stories.md` で発生)。

`.oxfmtrc.json` の `ignorePatterns` に `*.md` を追加し、Markdown は Prettier 出力を維持している。

## union type 改行の非互換

`src/prototypes/time-control/time-control-02/types.ts` で、union type の改行方針が Prettier と異なる(printWidth 境界での改行判定差)。個別に `ignorePatterns` へ追加して対応。

## バージョン注意

導入時点(2026-08-20)で `0.64.0`、開発中パッケージ。破壊的変更が頻発する可能性がある。

## パフォーマンス比較(2026-08-20 計測、リポジトリ全体 470 ファイル、`--check`)

- Prettier: 約 5.3 秒
- oxfmt: 約 1.7 秒(約 3 倍高速)

`--write` 全体適用の結果、Markdown を除く 469/470 ファイルで Prettier と出力が完全一致(高い互換性)。
