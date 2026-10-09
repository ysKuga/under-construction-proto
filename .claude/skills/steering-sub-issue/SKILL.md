---
name: steering-sub-issue
description: 親 issue の backlog 項目を GitHub の正式サブ issue として切り出し、`_issues/issue-{番号}-slug/` の steering を作成して親 backlog と相互リンクする。「サブ issue として分離」「サブ issue に切り出す」等の依頼時に使用する。
---

## 引数

`$ARGUMENTS`: `[親 issue 番号] [切り出す backlog 項目 or タイトル]`

## 手順

### 1. 切り出し内容を確定する

- 親 backlog.md の該当項目と、関連する decision-records.md のエントリを読む
- 以下をユーザーへ提示し、承認を得る
  - サブ issue のタイトル
  - 本文(目的・TODO)
  - slug
  - 分離理由(複数 PR にわたる等)
- `gh issue create` は外部への公開を伴うため、承認前に実行しない

### 2. issue を作成し親と紐づける

```bash
gh issue create --title "<タイトル>" --body "<本文>"
```

本文の形式(既存サブ issue に合わせる):

```markdown
親: #<親番号>

<切り出し元の説明>

## 目的

<目的>

## TODO

- [ ] ...
```

作成後、GitHub のサブ issue として親へ紐づける。

```bash
parent_id=$(gh issue view <親番号> --json id --jq .id)
child_id=$(gh issue view <子番号> --json id --jq .id)
gh api graphql -f query='mutation($p:ID!,$c:ID!){addSubIssue(input:{issueId:$p,subIssueId:$c}){issue{number}}}' -f p="$parent_id" -f c="$child_id"
```

- 確認: `gh api graphql -f query='{repository(owner:"ysKuga",name:"under-construction-proto"){issue(number:<子番号>){parent{number}}}}'`

### 3. steering を作成する

- 配置: `issue-<親番号>-slug/_issues/issue-<子番号>-slug/`([.claude/rules/steering.md](../../rules/steering.md))
  - 検討段階の `YYYYMMDD-slug/` が既にある場合は [steering-close](../steering-close/SKILL.md) 同梱スクリプトで `git mv` しリンクを書き換える
- 3ファイル([.claude/.steering/CLAUDE.md](../../.steering/CLAUDE.md))
  - design.md: `issue: #<子番号>（親: #<親番号>）`、背景・制約に切り出し元へのリンク
  - backlog.md: 切り出した項目を移す
  - decision-records.md: 分離の決定を1行記す

### 4. 親 steering を更新する

- 親 backlog.md の該当項目
  - 子要素へ「サブ issue #<子番号> へ分離（[_issues/issue-<子番号>-slug](_issues/issue-<子番号>-slug/backlog.md)）」を追記する
  - 移した詳細は親側から削除する(重複させない)
- 親 decision-records.md へ分離の決定を1行追記する

### 5. コミット

- 新規 steering の作成と親の更新をまとめて `docs(steering): <内容> をサブ issue #<子番号> として分離する`
- ブランチは子 issue 番号始まりで切る(コミット prefix が子番号になる)
