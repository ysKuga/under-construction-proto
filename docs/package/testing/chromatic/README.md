# chromatic

<https://www.chromatic.com/>

## 概要

Storybook の story を対象としたビジュアルリグレッションテストサービス。

- `npm run chromatic` で Storybook をビルドし、Chromatic 上へ publish してスナップショット比較する。
- ログ出力先(`chromatic.log`/`chromatic-diagnostics.json`/`storybook-build.log`)はデフォルトだとプロジェクトルート直下になるため、[chromatic.config.json](../../../../chromatic.config.json) の `logFile`/`diagnosticsFile`/`storybookLogFile` で `.chromatic/` 配下へ変更している。

## バージョン注意

v18 系(`chromatic@18`)。特筆すべき peer dependency 制約はない。
