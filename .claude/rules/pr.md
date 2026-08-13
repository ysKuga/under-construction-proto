# PR ルール

## タイトル

Issue に紐づく場合、コミットログと同様 Issue 番号を付与する。

- lefthook の prefix 付与はコミットメッセージのみ対象、PR タイトルには効かない。手動付与要。
- 形式: `#<Issue番号> type: 説明`(例: `#50 refactor: ...`)
- Issue 番号は branch 名先頭の数字から取得([コミットルール](commit.md)と同じ由来)。
