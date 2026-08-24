# steering ディレクトリ命名

`.claude/.steering/` 配下ディレクトリ、対応する issue/PR の有無で命名形式を分ける。プロジェクト固有ルール(global `/steering` コマンドの挙動は変更しない、`.claude/commands/steering.md` で上書き)。

## 形式

- **issue 直結**(issue 単位の大きな作業テーマ): `issue-{issue番号}-slug`
  - 例: `issue-96-app-top-page-readme-style`
- **個別作業(検討段階、PR 未作成)**: `YYYYMMDD-slug`(従来通り)
  - issue 直結 steering から分割するサブ作業もここに含む。issue 番号は付与しない(親 steering の実装計画から相対パス参照される時点で文脈が明らか)
- **個別作業(実装フェーズ、PR あり)**: `pr-{PR番号}-slug`
  - 空 PR を先に作成し番号を確保 → 検討段階の `YYYYMMDD-slug` から `git mv` でリネーム

## 例

`.claude/.steering/issue-96-app-top-page-readme-style/design.md` の実装計画から、追加検討が必要な項目を `.claude/.steering/20260825-box-bot-display-tuning/` へ分割。実装着手時に空 PR(#101)を作成し `pr-101-box-bot-display-tuning/` へリネーム。
