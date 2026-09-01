# steering ディレクトリ命名

`.claude/.steering/` 配下ディレクトリ、対応する issue/PR の有無で命名形式を分ける。プロジェクト固有ルール(global `/steering` コマンドの挙動は変更しない、`.claude/commands/steering.md` で上書き)。

## 形式

- **issue 直結**(issue 単位の大きな作業テーマ): `issue-{issue番号}-slug`
  - 例: `issue-96-app-top-page-readme-style`
  - issue 直結 steering から分割するサブ作業、親配下へネスト配置: `issue-{issue番号}-slug/YYYYMMDD-slug/`。issue 番号は付与しない(ネスト位置自体で親が明らか)
- **個別作業(検討段階、PR 未作成、issue 非紐づけ)**: `YYYYMMDD-slug`(従来通り)
- **実装フェーズ(PR あり)**: `_pr/pr-{PR番号}-slug/`(`_closed/` と対になる中間ディレクトリ、issue 配下・非紐づけ共通)
  - 空 PR を先に作成し番号を確保 → 検討段階の `YYYYMMDD-slug` から `_pr/pr-{PR番号}-slug/` へ `git mv`
  - **issue 直結配下のサブ作業で着手が確定済みの場合**、`YYYYMMDD-slug` の検討段階を挟まず、最初から `_pr/pr-{PR番号}-slug/` で作成する。手順: 空コミットで PR を先行作成 → 番号確保 → その番号でディレクトリ作成し design.md 配置。以後の実装コミットはこの PR へ紐づく

## close

対応完了時、`_closed/pr-{PR番号}-slug/` へ `git mv`(対応 PR がある場合、close 時点で PR 番号をディレクトリ名へ必ず反映)。

- issue 直結配下のサブ作業: 親 issue ディレクトリ配下のローカル `_closed/`(`issue-{issue番号}-slug/_closed/pr-{PR番号}-slug/`)。親 issue 自体は未完了のまま残る場合が多い
- issue 非紐づけの個別作業: トップレベル `.claude/.steering/_closed/`
- PR を経ずに close する個別作業(検討のみで完結等)は `YYYYMMDD-slug` のまま

## 例

`.claude/.steering/issue-96-app-top-page-readme-style/design.md` の実装計画から、追加検討が必要な項目を `.claude/.steering/issue-96-app-top-page-readme-style/20260825-box-bot-display-tuning/` へ分割。実装着手時に空 PR(#101)を作成し `issue-96-app-top-page-readme-style/_pr/pr-101-box-bot-display-tuning/` へリネーム。対応完了後 `issue-96-app-top-page-readme-style/_closed/pr-101-box-bot-display-tuning/` へ close。
