# コミットルール

## 粒度

細かく分割する。背景と結び付けやすい単位を1コミットとする。

## 順序

エラー・ビルド失敗するコミット、例外除き禁止。部品とそれ使う実装がある場合、部品側から先にコミットする(依存関係の順、トポロジカル順)。

## メッセージ

タイトルのみで不明瞭なもの、詳細記述する。詳細部分、markdown箇条書き(`-`)使用。

タイトル形式: `type(scope): 説明`。scope 省略可。type 一覧 下記。

- GitHub などの Issue 番号は lefthook で branch 参照で自動で付与される。

## type

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) 準拠。

- `feat`: 機能追加
- `fix`: バグ修正
- `docs`: 文書のみ変更。README・`docs/`・steering `design.md` 等、内容の追加・更新
- `refactor`: 挙動変えない内部改善(バグ修正・機能追加でない)
- `test`: テスト追加・修正
- `chore`: ビルド・ツール・依存・設定変更。内容変えないファイル移動/リネーム/削除(steering の `_pr/`・`_closed/` への `git mv` 等)含む
- `build`: ビルドシステム・外部依存の変更
- `ci`: CI 設定・スクリプト変更
- `style`: 空白・整形等、コード意味変えない変更
- `perf`: パフォーマンス改善

破壊的変更: `type!:` またはフッター `BREAKING CHANGE:`。

### docs と chore の境界

- 文書の中身を書く/直す → `docs`(steering `design.md` の新規作成・追記含む)
- 文書ファイルの移動・リネーム・close のみ(中身変更なし) → `chore`

## スコープ

PR 向けコミット対象、関連する内容にする。全体に関わる設定(開発ツール・環境設定等)、できるだけ混ぜない。
