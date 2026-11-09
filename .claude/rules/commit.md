# コミットルール

## 粒度

細かく分割する。背景と結び付けやすい単位を1コミットとする。

## 順序

エラー・ビルド失敗するコミット、例外除き禁止。部品とそれ使う実装がある場合、部品側から先にコミットする(依存関係の順、トポロジカル順)。

## コミット前の規約確認

実装(コード変更)のコミット前、`rules-reviewer` で差分確認する。\
指摘直してからコミットする。

- PR 作成時([pr-create](../skills/pr-create/SKILL.md))の確認を待たない
- 対象外
  - Markdown のみの変更
  - 中身を変えない移動・リネーム
- 理由: PR #369・#371 で、規約違反を後から直すコミットが続いた
  - if 条件の名前付き定数化(if-intent)
  - hook への分割・変数の JSDoc(hooks・jsdoc)

## メッセージ

タイトルのみで不明瞭なもの、詳細記述する。詳細部分、markdown箇条書き(`-`)使用。

タイトル形式: `type(scope): 説明`。scope 省略可。type 一覧 下記。

- GitHub などの Issue 番号は lefthook で branch 参照で自動で付与される。
- branch 外(detached HEAD)でのコミット作り直し、番号 付与されない
  - 例: `git checkout <hash>` からの amend
  - 対処: メッセージへ `#<番号>` 手書き
  - 理由: PR #407 の rebase 後の作り直しで番号 欠落、force push やり直し
- rebase・cherry-pick の競合解消後の継続、件名(`#<番号> ...`)消える
  - 原因: エディタを通さず続けても(`GIT_EDITOR=true`)メッセージの掃除が走る
    - `#` 始まりの件名がコメント扱いで消える
  - 症状: `Co-Authored-By: ...` が件名になる
  - フックを止めても(`core.hooksPath=/dev/null`)防げない
  - rebase: `GIT_EDITOR=true git -c core.commentChar=auto rebase --continue`
  - cherry-pick: 競合解消・`git add` 後、`git -c core.hooksPath=/dev/null commit -C <元のコミット>` でコミット。\
    残りがあれば `git cherry-pick --continue`
    - `core.commentChar=auto` の `cherry-pick --continue` は件名残るが、`# Conflicts:` の行がメッセージへ残る
  - 継続後 `git log --oneline` で件名確認。崩れた場合の直し方: [stack-rebase](../skills/stack-rebase/SKILL.md)「コミットの作り直し」
  - 理由: PR #410・#412・#411 の付け替えで 3 回崩れた。git 2.43 で再現・確認(2026-11-09)

## 一部のファイルだけのコミット

作業ツリーの変更の一部だけをコミットする時、`git stash --keep-index` で残りを退避して確認しない。

1. 対象を `git add` する
2. 型チェックを `&&` でつなぎ、通った時だけコミットする(`;` でつながない)
3. コミットの単体で通るか確かめる場合、コミット後に別の作業ツリーで型チェックする([stack-rebase](../skills/stack-rebase/SKILL.md)「確認して push する」)

- 失敗した場合、push 前に限り `git reset --soft HEAD~1` で戻す
- 理由: PR #412 で `stash --keep-index` 中に作業ツリーを編集し、`stash pop` が競合した。\
  型チェックの失敗を `;` でつないだまま、未完成のファイルを含むコミットを作った
  - `stash drop` は自動モードの判定で拒否され、退避の中身を手で戻した

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
