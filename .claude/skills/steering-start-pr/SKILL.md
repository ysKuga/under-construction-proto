---
name: steering-start-pr
description: 着手確定済みの作業について、空コミットで PR を先行作成して番号を確保し、`_pr/pr-{番号}-slug/` の steering(design.md・backlog.md・decision-records.md)を作成する。「PR を作って着手」「実装を開始」等、PR 単位の作業へ入る時に使用する。
---

## 引数

`$ARGUMENTS`: `[親 steering ディレクトリ] [slug] [タイトル]`

- 不足分は会話の文脈から補う。決まらなければユーザーへ確認する

## 手順

### 1. 配置を決める

[.claude/rules/steering.md](../../rules/steering.md) に従う。

- issue 直結配下のサブ作業(着手確定済み): `issue-N-slug/_pr/pr-{番号}-slug/`
- 正式サブ issue 配下: `issue-N-slug/_issues/issue-K-slug/_pr/pr-{番号}-slug/`
- issue 非紐づけ: `_pr/pr-{番号}-slug/`
- 検討段階の `YYYYMMDD-slug/` が既にある場合は新規作成せず、手順 4 で `git mv` する
- slug の命名は同階層の既存ディレクトリと照合する([.claude/rules/naming-consistency.md](../../rules/naming-consistency.md))

### 2. ブランチを切る

- ブランチ名は issue 番号を先頭に付ける(例: `297-en-spot-use`、[.claude/rules/issue-linking.md](../../rules/issue-linking.md))
- 未マージ PR に依存する場合は依存先ブランチから切る([.claude/rules/pr.md](../../rules/pr.md)「ベースブランチ」)

### 3. 空コミットで PR を作成する

```bash
git commit --allow-empty -m "chore: <作業内容> の PR を作成する"
git push -u origin HEAD
gh pr create --draft --base <main or 依存先ブランチ> --title "#<issue番号> <type>: <説明>" --body "<概要のみ>"
```

- コミットメッセージの issue 番号は lefthook が自動付与する。手で付けない
- PR タイトルの issue 番号は手で付ける([.claude/rules/pr.md](../../rules/pr.md))
- 本文は概要だけでよい。変更内容は [pr-create](../pr-create/SKILL.md) で完成させる
- 発行された PR 番号を控える

### 4. steering を作成する

- `_pr/pr-{番号}-slug/` を作成する(検討段階のものがあれば `git mv`)
- [.claude/.steering/CLAUDE.md](../../.steering/CLAUDE.md) の構成に従い3ファイルを置く
  - design.md: `# タイトル` → `PR: #番号`(親があれば `(親: #N)`) → 目的 → 背景・制約 → 懸念・リスク
  - backlog.md: `# 実装計画（<タイトル>）` + 未完了項目
  - decision-records.md: `# 決定事項（<タイトル>）` + 当日日付のエントリ
- 親 backlog の該当項目へ、新しい design.md へのリンクを子要素として追記する
- `~/.claude/recent.md` へ1行追記する(`/steering` コマンドと同形式)

### 5. コミット

- `docs(steering): <作業内容> の design を作成する`
