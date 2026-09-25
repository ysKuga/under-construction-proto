# PR ルール

## タイトル

Issue に紐づく場合、コミットログと同様 Issue 番号を付与する。

- lefthook の prefix 付与はコミットメッセージのみ対象、PR タイトルには効かない。手動付与要。
- 形式: `#<Issue番号> type: 説明`(例: `#50 refactor: ...`)
- Issue 番号は branch 名先頭の数字から取得([コミットルール](commit.md)と同じ由来)。

## 粒度

PR 細かい単位で分ける。変更箇所 多いとレビュー時 把握不可。

- 下準備(汎用 hook 変更・置き場新設等)と本対応、同一 PR に混ぜない
- 実装計画時、PR 単位へ分解・依存関係付きで提示してから着手
- 依存しない PR、前段待たず並行作成可

## ベースブランチ

未マージ PR に依存する対応、main でなく依存先ブランチをベースにする。

- ブランチ作成: 依存先ブランチから切る
- PR 作成: `gh pr create --base <依存先ブランチ>`
- 依存なし → main ベース
- 依存先マージ後、GitHub が base を main へ自動変更。差分残る場合 main を取込む

## Storybook リンク

対象 PR で `index.stories.tsx` を新規作成・更新した場合、PR 本文へ該当 story の URL を記載する。

- 常駐 Storybook(`localhost:6006`、[実ブラウザ動作確認](../../CLAUDE.md)参照)でブラウザ表示し、URL をコピーして使う
- 形式: `http://localhost:6006/?path=/story/<story-id>`(例: `http://localhost:6006/?path=/story/components-pages-find-path-prototypes-proto-03--default`)
- 複数 story 更新時は全て列挙する

## steering close 確認

PR 作成時、`.claude/.steering/` 配下(`_closed/` 除く)にブランチの変更へ対応する steering ディレクトリがあれば close 可能か確認する。

- 判定基準: 対象 design.md の「実装計画」項目が全て完了、または「目的」達成しているか
- close 可能と判断した場合、ユーザーへ提示・承認を得た上で `git mv .claude/.steering/[dir] .claude/.steering/_closed/[dir]` を実行
- 未完了項目が残る場合は close 対象外のまま維持
