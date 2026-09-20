# chromatic

<https://www.chromatic.com/>

## 概要

Storybook の story を対象としたビジュアルリグレッションテストサービス。

- `npm run chromatic` で Storybook をビルドし、Chromatic 上へ publish してスナップショット比較する。
- ログ出力先(`chromatic.log`/`chromatic-diagnostics.json`/`storybook-build.log`)はデフォルトだとプロジェクトルート直下になるため、[chromatic.config.json](../../../../chromatic.config.json) の `logFile`/`diagnosticsFile`/`storybookLogFile` で `.chromatic/` 配下へ変更している。

## 環境変数

`CHROMATIC_PROJECT_TOKEN` が必要。ローカル実行時は `.env.chromatic` に記述する(`chromatic.env.example` を参考にコピーして使う、`.env.chromatic` 自体は git 管理対象外)。

```sh
CHROMATIC_PROJECT_TOKEN=<Chromatic プロジェクトのトークン>
```

`npm run chromatic` は `node --env-file-if-exists=.env.chromatic` 経由で `.env.chromatic` を読み込む(ファイルが無ければ無視され、CI 側で直接渡された環境変数がそのまま使われる)。

## バージョン注意

v18 系(`chromatic@18`)。特筆すべき peer dependency 制約はない。
