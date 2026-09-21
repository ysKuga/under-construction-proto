# chromatic

<https://www.chromatic.com/>

## 概要

Storybook の story を対象としたビジュアルリグレッションテストサービス。

- `npm run chromatic` で Storybook をビルドし、Chromatic 上へ publish してスナップショット比較する。
- ログ出力先(`chromatic.log`/`chromatic-diagnostics.json`/`storybook-build.log`)はデフォルトだとプロジェクトルート直下になるため、[chromatic.config.json](../../../../chromatic.config.json) の `logFile`/`diagnosticsFile`/`storybookLogFile` で `.chromatic/` 配下へ変更している。

## 環境変数

`CHROMATIC_PROJECT_TOKEN` が必要。ローカル実行時は `.env.chromatic` に記述する(`.env.chromatic` 自体は git 管理対象外)。

```sh
CHROMATIC_PROJECT_TOKEN=<Chromatic プロジェクトのトークン>
```

`.env.chromatic` は `npm run prepare`(`scripts/prepare.sh`)実行時、`.env.chromatic.example` から自動生成される(既存ファイルは上書きしない)。他サービスの環境変数を追加する場合も `.env.<service>.example` を置くだけで同じ仕組みに乗る。

`npm run chromatic` は `node --env-file-if-exists=.env.chromatic` 経由で `.env.chromatic` を読み込む(ファイルが無ければ無視され、CI 側で直接渡された環境変数がそのまま使われる)。

## ビルドエラーの調べ方

`npm run chromatic` が `component error` で失敗した場合、ローカルの `.chromatic/chromatic.log` `.chromatic/diagnostics.json` には失敗件数(`errorCount`)しか載らず、どの story が失敗したかは分からない。

1. ターミナル出力の `Review the errors at https://www.chromatic.com/setup?appId=...` の URL(または `.chromatic/diagnostics.json` の `build.webUrl`)を開く
2. ビルド詳細ページで、エラーになった story 名・component 名を確認する
3. 各 story の個別テストページ(ビルド詳細ページ内のリンク、`https://www.chromatic.com/test?appId=...&id=...`)で具体的なエラーメッセージを確認する

### よくある原因: キャプチャ上限超過

story 1 件あたりの描画結果が `幅 × 高さ` で 25,000,000px を超えると、以下のようなエラーで component error になる。

```text
Your story couldn't be captured because it exceeds our 25,000,000px limit. Its dimensions are <width>x<height>px.
```

大量アイテムのリスト等、縦に長く伸びる story で発生しやすい([list-02](../../../../src/prototypes/list-rendering/list-02/index.tsx) で 500 件フル描画時に発生した例)。対応:

- 固定高さ + `overflow-y-auto` でスクロールコンテナ化し、キャプチャ対象のサイズを抑える(表示件数はそのまま保てる)
- 表示件数自体を減らす
- story の性質上ビジュアル差分比較の意義が薄いなら `parameters: { chromatic: { disableSnapshot: true } }` でスナップショット自体を無効化する

## 既知の問題

`storybookLogFile` の設定(`.chromatic/storybook-build.log` を指定)が効かず、`build-storybook.log` という名前でプロジェクトルート直下に出力される。公式ドキュメント上は config file 対応と明記されているが実際には反映されない(chromatic v18.9.4 で確認)。`.gitignore` 対象済みのためリポジトリへの実害はない。

## バージョン注意

v18 系(`chromatic@18`)。特筆すべき peer dependency 制約はない。
