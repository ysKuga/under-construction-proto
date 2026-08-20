# oxlint

<https://oxc.rs/docs/guide/usage/linter>

## 概要

oxc プロジェクト製 Rust 実装 linter。ESLint 併用で導入、置き換えではない。

- 既存 ESLint(`.eslintrc.cjs`)はそのまま維持。`import/no-restricted-paths`(層境界制約)、`check-file`(命名規約)、`perfectionist`、`tailwindcss` 等のカスタムルールは oxlint 未対応のため。
- oxlint はビルトイン独自ルール(unicorn/react/nextjs/vitest/jsx-a11y 各 plugin)で高速検出を担う。ESLint と重複検出があっても許容。
- 設定ファイル: `.oxlintrc.json`

## パフォーマンス比較(2026-08-20 計測、src 配下 373 ファイル)

- ESLint(`npm run lint`): 約 28.7 秒
- oxlint(`npx oxlint .`): 約 0.4 秒(約 70 倍高速)

oxlint 独自ルールで ESLint 未検出の問題も複数検出(`react/set-state-in-effect`、`next/no-img-element`、`unicorn/no-useless-spread`、`vitest/require-mock-type-parameters` 等)。
