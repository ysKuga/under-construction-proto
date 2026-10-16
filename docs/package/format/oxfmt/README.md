# oxfmt

<https://oxc.rs/docs/guide/usage/formatter>

## 概要

oxc プロジェクト製 Rust 実装 formatter。`.oxfmtrc.json` で Prettier 設定を引き継いで採用。

- `--migrate=prettier` で `.prettierrc.cjs` から自動生成可能。
- コード(`.ts`/`.tsx`/`.js`/`.jsx`/`.cjs`/`.mjs` 等)・Markdown(`.md`)のフォーマットに採用。

## Markdown

`0.73.0` で Markdown が Rust ネイティブ対応となり、Prettier から移行した(2026-10-16)。

- 全 `.md` 適用の結果、oxfmt が変更したファイルは Prettier の出力と完全一致
- `overrides` で `*.md` のみ `embeddedLanguageFormatting: "off"` を指定し、コードフェンス内を整形しない
  - ルール文書の例示コードを記述どおりに保つため
  - `*.md` 限定にするのは、CSS-in-JS 等 Markdown 以外の埋込みへ影響させないため

### 導入時に除外していた経緯

`0.64.0` 導入時、コードフェンス内の整形による意図しない書換えを oxfmt 固有のバグと判断し、`*.md` を `ignorePatterns` で除外していた。

- 例: ` ```ts ` 内の `<T,>` が `<T>` に削除(`.claude/rules/react/hooks.md`)
- 例: 複数行の `args: { /* ... */ }` が1行に整形(`.claude/rules/react/stories.md`)

後の検証で、いずれも Prettier でも同一出力になると判明した。

- `<T,>` は `.ts` では不要な構文のため、` ```ts ` フェンスでは削除されるのが正しい挙動(` ```tsx ` なら保持)
- 現在は `embeddedLanguageFormatting: "off"` によりフェンス内を整形しないため発生しない

## union type 改行の非互換

`src/prototypes/time-control/time-control-02/types.ts` で、union type の改行方針が Prettier と異なる(printWidth 境界での改行判定差)。個別に `ignorePatterns` へ追加して対応。

## バージョン注意

導入時点(2026-08-20)で `0.64.0`、Markdown 移行時点(2026-10-16)で `0.73.0`。開発中パッケージ。破壊的変更が頻発する可能性がある。

## パフォーマンス比較(2026-08-20 計測、リポジトリ全体 470 ファイル、`--check`)

- Prettier: 約 5.3 秒
- oxfmt: 約 1.7 秒(約 3 倍高速)

`--write` 全体適用の結果、Markdown を除く 469/470 ファイルで Prettier と出力が完全一致(高い互換性)。
