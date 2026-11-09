---
name: stack-rebase
description: 未マージの PR の上に積んだ PR のブランチを、ベースの PR の更新・切り出し後に順に付け替える。「積んだ PR を付け替える」「ベースの更新を取り込む」「rebase して force push」等の依頼時、またはベースの PR へコミットを足した後・下準備を別 PR へ切り出した後に使用する。
---

## 引数

`$ARGUMENTS`: 付け替える PR(番号・ブランチ)。複数なら下から順に並べる。

- 省略時は、現在のブランチと、それをベースにする PR(`gh pr list --base <branch>`)を候補として提示する

## 手順

### 1. 付け替えの順と基点を控える

- 積んだ順に、下(main 寄り)から 1 つずつ付け替える
- ブランチごとに、付け替える前のベースの先頭を控える
  - `git merge-base <ブランチ> origin/<古いベース>`
  - ベースを rebase・amend した後は、古いベースの先頭がブランチの履歴にしか残らない。先に控える

### 2. 付け替える

```bash
git switch <ブランチ>
git rebase --onto <新しいベース> <古いベースの先頭>
```

- 下準備を切り出した場合、元の PR は切り出した PR のブランチへ付け替える
- ベースで識別子を改名した等、途中のコミットが型エラーになる場合、そのコミット自体を直す
  - 後から直すコミットを足さない([commit.md](../../rules/commit.md)「順序」)
  - 手順は下記「コミットの作り直し」

### 3. 競合を直す

steering の親 backlog.md が競合しやすい(PR ごとに子要素のリンクを足すため)。

- 両方の子要素を残し、番号を `1.` から振り直す
- リンクは各手順の下の子要素へ置く

```markdown
- [ ] EN スポットの使用・EN 切れの救助を選択肢パネルへ移す
  1. 選択肢を event で登録する仕組みを足す
     - [_pr/pr-412-.../design.md](_pr/pr-412-.../design.md)
  2. EN スポット・救助の吹き出しを外す
     - [_pr/pr-411-.../design.md](_pr/pr-411-.../design.md)
```

### 4. 件名を確認する

競合を直して続けたコミットは、件名が消えることがある(`#393 ...` が消え、`Co-Authored-By: ...` が件名になる)。

- 付け替えの後、必ず `git log --oneline <新しいベース>..HEAD` で件名を一通り見る
- 崩れていれば下記「コミットの作り直し」で直す

### 5. 確認して push する

- 型チェック・lint・テスト([pr-create](../pr-create/SKILL.md)「確認を実施する」)
- 途中のコミットを直した場合、そのコミットでも型チェックを通す(別の作業ツリーで確認する)

```bash
git worktree add --detach <一時ディレクトリ> <コミット>
ln -s $PWD/node_modules <一時ディレクトリ>/node_modules
(cd <一時ディレクトリ> && npx tsc --noEmit -p .)
git worktree remove --force <一時ディレクトリ>
```

- force push はユーザーの承認を得てから行う

```bash
git push --force-with-lease=<ブランチ>:origin/<ブランチ> origin HEAD:<ブランチ>
gh pr edit <PR 番号> --base <新しいベース>   # ベースが変わる場合のみ
```

- push 済みのコミットへの `commit --amend` は行わない(自動モードの判定で拒否される)。直しは追加のコミットにする

## コミットの作り直し

付け替え中に、途中のコミット(件名の崩れ・型エラー)を直す手順。

```bash
git switch --detach <直すコミット>
# ファイルを直す場合: 編集して git add
git -c core.hooksPath=/dev/null commit --amend -m "#<issue 番号> <type>: <説明>

Co-Authored-By: ..."
NEW=$(git rev-parse HEAD)
git switch <ブランチ>
git -c core.hooksPath=/dev/null rebase --onto $NEW <直すコミット>
```

- detached HEAD のため issue 番号は自動で付かない。件名へ手で書く([commit.md](../../rules/commit.md)「メッセージ」)
- フックを止めるのは、付け替え済みのコミットへ番号を二重に付けないため

## 理由

PR #410・#412・#411 を積んだ状態で、規約の指摘の修正・下準備の切り出しのたびに手作業で付け替えた(1 セッションで 6 回)。

- 競合は 3 回とも同じ親 backlog.md。直し方(番号の振り方)が回ごとに違った
- 競合を直して続けたコミットの件名が 3 回消えた。push 前に気づいて直した
- ベースでの改名で、積んだ PR の途中のコミットが型エラーになった
- PR #407・#408 でも手作業で付け替えていた([pr.md](../../rules/pr.md)「ベースブランチ」)
