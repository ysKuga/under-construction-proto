# docs/concept/structure

構成について (issue #1)。現行の `src/` 単一パッケージ構成とは別に、将来的な monorepo 化などを想定した検討案。

以下を想定。

`packages/` は汎用的すぎるか。

- `packages/`
  `apps/` などにしたほうがよいか。
  - `logic`
    - ロジック
    - [ ] 場所について検討
    - `packages/web/` 配下の Storybook 設定を利用して stories を使う。
      - stories の参照を `../logic/**.stories.*` といった形で指定できたら
  - `web`
    - とりあえずなんらかの JS フレームワーク
- `settings/`
  ESLint などの設定を格納
  - `eslint`
- `dev/`
  開発に使用するものを格納
  - `storybook`
  - `cypress`

## ESLint の共通設定

ESLint のベースをプロジェクトルートに定義し、`packages/` 配下にて `extends` などできたら。
