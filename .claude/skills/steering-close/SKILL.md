---
name: steering-close
description: 対応完了した steering ディレクトリを `_closed/` へ移動し、移動で壊れる相対リンクの書換・親 backlog の完了反映まで行う。「steering を close」「_closed へ移動」等の依頼時、または PR 作成時の steering close 確認で close 可と判断した場合に使用する。
---

## 引数

`$ARGUMENTS`: close 対象の steering ディレクトリ(パス or ディレクトリ名)。複数可。

- 省略時は現在ブランチの変更に対応する steering ディレクトリ(`_closed/` 除く)を候補として提示する

## 手順

### 1. close 可否を判定する

- 判定基準([.claude/rules/pr.md](../../rules/pr.md)「steering close 確認」)
  - 対象 backlog.md(無ければ design.md の実装計画)の項目が全て完了
  - または design.md の「目的」を達成
- 対応 PR がある場合、`gh pr view <番号> --json state,mergedAt` でマージ状況を確認する
- 未完了項目が残る場合は close 対象外とし、残項目を提示して終了する
- 判定結果と移動先をユーザーへ提示し、承認を得てから次へ進む

### 2. 移動先を決める

[.claude/rules/steering.md](../../rules/steering.md)「close」に従う。

| 移動元                                               | 移動先                                              |
| ---------------------------------------------------- | --------------------------------------------------- |
| `issue-N-slug/_pr/pr-M-slug/`                        | `issue-N-slug/_closed/pr-M-slug/`                   |
| `issue-N-slug/_issues/issue-K-slug/`(正式サブ issue) | `issue-N-slug/_closed/issue-K-slug/`                |
| `_pr/pr-M-slug/`(issue 非紐づけ)                     | `_closed/pr-M-slug/`                                |
| `YYYYMMDD-slug/`(PR あり)                            | `_closed/pr-M-slug/`(PR 番号をディレクトリ名へ反映) |
| `issue-N-slug/`(issue 直結)                          | `_closed/issue-N-slug/`                             |

- PR を経ずに検討のみで完結した `YYYYMMDD-slug` は名前を変えない
- 入れ子の場合(サブ issue 配下に `_pr/` が残る等)、内側から順に close する

### 3. 移動とリンク書換

リポジトリルートで同梱スクリプトを実行する。先に `--dry-run` で書換内容を確認する(省略しない)。

```bash
python3 -I .claude/skills/steering-close/scripts/move-and-relink.py <移動元> <移動先> --dry-run
python3 -I .claude/skills/steering-close/scripts/move-and-relink.py <移動元> <移動先>
```

- `git mv` と、全 `.md` ファイル内の相対リンク書換を一括で行う
  - 他ファイルから移動対象を指すリンク
  - 移動対象内から外を指すリンク(階層が変わる場合)
  - 表示テキストがリンク先のパスと同じ場合は、表示テキストも書き換える
- リンク先が実在しないリンクは触らない
- 移動で空になった移動元の親ディレクトリ(`_pr/` 等)は削除する

### 4. 親 backlog へ反映する

- 親 issue の backlog.md で、対象に当たる項目を完了にする
  - 完了した項目は削除する([.claude/.steering/CLAUDE.md](../../.steering/CLAUDE.md))
- 項目内のリンクがスクリプトで書き換わったか確認する
- decision-records.md へ完了の旨を追記する

親 backlog の項目の一部(PR 単位の子要素)だけが完了した場合、項目は残し子要素を書き換える。

- 項目全体が完了: 項目ごと削除する
- 一部が完了: 完了した子要素(PR へのリンク行)を削除するか、残りが分かる状況説明へ置き換える

```markdown
<!-- 前 -->
- [ ] `expedition` に合わせて改名する
  - event 名: [_closed/pr-385-expedition-rename-events/design.md](_closed/pr-385-expedition-rename-events/design.md)

<!-- 後 -->
- [ ] `expedition` に合わせて改名する
  - event 名は改名済み（残りはコンポーネント名）
```

親 decision-records.md へ以下の形で追記する。

- 1 行目: 日付・見出し・PR 番号
- 子要素: `_closed/` の design.md へのリンク

```markdown
- 2026-10-18（event 名の改名）: event 名を `FindPath` から `Expedition` へ改名した（PR #385）
  - [_closed/pr-385-expedition-rename-events/design.md](_closed/pr-385-expedition-rename-events/design.md)
```

### 5. コミット

[.claude/rules/commit.md](../../rules/commit.md) に従い、中身の変更有無で分ける。

- 移動 + リンク書換のみ → `chore(steering): ... の steering を close する`
- backlog の完了反映など中身の変更 → `docs(steering): ... を完了にする`
- 部品側(移動)を先にコミットする
