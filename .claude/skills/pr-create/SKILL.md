---
name: pr-create
description: プロジェクトの PR ルール(タイトルの issue 番号・ベースブランチ・Storybook リンク・steering close 確認)に従って PR を作成・更新する。「PR を作成」「PR を出す」「PR 本文を書いて」等の依頼時に使用する。
---

## 手順

### 1. 差分を把握する

- `git log --oneline <base>..HEAD` と `git diff --stat <base>...HEAD` で変更範囲を確認する
- 変更が多すぎる・下準備と本対応が混在する場合、分割を提案する([.claude/rules/pr.md](../../rules/pr.md)「粒度」)

### 2. ベースブランチを決める

- 未マージ PR のブランチから切っている場合はそのブランチ、それ以外は main
- 判定: `git merge-base --is-ancestor origin/main HEAD` と、親ブランチの PR 状態(`gh pr list --head <branch>`)

### 3. 確認を実施する

push 前に以下を通す。失敗した場合は PR 作成へ進まず報告する。

```bash
yarn check-types
yarn lint
NEXT_PUBLIC_API_URL=http://localhost:3000 npx vitest run <変更箇所>
```

- UI 変更がある場合、`story-verifier` サブエージェントで Storybook 上の動作を確認する

### 4. タイトル・本文を作る

- タイトル: `#<issue番号> <type>: <説明>`(issue 番号は branch 名先頭の数字、無ければ省略)
- 本文の構成(既存 PR に合わせる)

```markdown
## 概要

<issue #N の PR-x 等の位置付け。1〜2 文>

## 変更内容

- <要素ごとに箇条書き、子要素で詳細>

## 確認

- <実行したテスト・tsc の結果>
- Storybook(<story 名>)で以下を確認
  - <確認内容>

## Storybook

- http://localhost:6006/?path=/story/<story-id>

## 補足

- <本 PR で扱わないこと・backlog へ回したこと>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

- Storybook 節: `index.stories.tsx` を新規作成・更新した場合のみ。該当 story を全て列挙する
  - story id は `curl -s http://localhost:6006/index.json` から引く
- 該当しない節は省く

### 5. steering close を確認する

- `.claude/.steering/` 配下(`_closed/` 除く)で、本ブランチの変更に対応する steering を探す
- close 可能なら [steering-close](../steering-close/SKILL.md) で対応する(ユーザー承認後)

### 6. 作成する

```bash
git push -u origin HEAD
gh pr create --base <base> --title "<タイトル>" --body "<本文>"
```

- 先行作成済みの空 PR([steering-start-pr](../steering-start-pr/SKILL.md))がある場合は `gh pr edit` で本文・タイトルを更新し、draft を解除する(`gh pr ready`)
- 作成した PR の URL をユーザーへ伝える

### 7. 作業を振り返る

`workflow-retro` サブエージェントへ現在のブランチ名を渡し、定型化の候補を受け取る。

- 「候補なし」なら何も伝えない
- 候補があれば PR の URL と併せて提示する
- 作成・追記はユーザーの承認後に行う(本 PR へ積むか別 PR にするかも確認する)
