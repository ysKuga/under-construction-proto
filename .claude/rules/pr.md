# PR ルール

## タイトル

Issue に紐づく場合、コミットログと同様 Issue 番号を付与する。

- lefthook の prefix 付与はコミットメッセージのみ対象、PR タイトルには効かない。手動付与要。
- 形式: `#<Issue番号> type: 説明`(例: `#50 refactor: ...`)
- Issue 番号は branch 名先頭の数字から取得([コミットルール](commit.md)と同じ由来)。

## steering close 確認

PR 作成時、`.claude/.steering/` 配下(`_closed/` 除く)にブランチの変更へ対応する steering ディレクトリがあれば close 可能か確認する。

- 判定基準: 対象 design.md の「実装計画」項目が全て完了、または「目的」達成しているか
- close 可能と判断した場合、ユーザーへ提示・承認を得た上で `git mv .claude/.steering/[dir] .claude/.steering/_closed/[dir]` を実行
- 未完了項目が残る場合は close 対象外のまま維持
