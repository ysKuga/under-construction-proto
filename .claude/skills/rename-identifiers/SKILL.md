---
name: rename-identifiers
description: 識別子(型・コンポーネント・変数・event key)とファイル名を、対応表に沿って機械的に改名する。「改名する」「名前を〜に合わせる」「〜へリネーム」等、挙動を変えずに名前だけ変える依頼時に使用する。ディレクトリの移動・コピーのみの場合は move-path-references ルールに従う。
---

## 引数

`$ARGUMENTS`: 改名の対象・新しい名前・対象外の範囲

- 不足分は会話の文脈・steering から補う

## 手順

### 1. 対応表と範囲を決める

- 旧名を洗い出す
  - `git grep -o -h -E "<旧名の正規表現>" -- <対象> | sort | uniq -c`
  - 表記の揺れも含める: `FindPath`・`findPath`・`find-path`・`find_path`
  - 旧名が複合語(`FindPathProto03` 等)の場合、構成要素ごとの揺れも含める: `proto-03`・`Proto03`
  - ここで洗い出した揺れを、手順 4・5 の検索パターンにもそのまま使う
- 対応表(旧 → 新)と対象外の範囲をユーザーへ提示し、合意してから着手する
  - 対象外の例: prototypes、別 PR へ回す名前、経緯として残す言及
- 新しい名前は既存の命名と照合する([naming-consistency.md](../../rules/naming-consistency.md))

### 2. ファイル名を変える

```bash
git mv <旧パス> <新パス>
```

### 3. 識別子を置換する

`.claude/scripts/replace-in-files.py` の glob・正規表現置換で行う。\
対象外の配下は `!` で始まるキーで外す。

```bash
python3 -I -B .claude/scripts/replace-in-files.py - <<'EOF'
{
  "src/a/**/*.ts*": [
    {"regex": "FindPath-", "repl": "Expedition-"},
    {"regex": "FindPathEvent", "repl": "ExpeditionEvent"},
    {"regex": "use-find-path-event-", "repl": "use-expedition-event-"}
  ],
  "!src/a/_prototypes/**": []
}
EOF
```

- 旧ファイル名への import も同じ置換で付け替える
- ヒアドキュメント内で `$変数` は展開されない(`<<'EOF'`)
  - パスは直書きする

### 4. コメント・JSDoc の旧名を探す

識別子の置換は、自然文中の旧名(「find-path 専用」等)を拾わない。

```bash
git grep -n -i -E "find-?path|proto-?03" -- <対象> ':!<対象外>'
```

- 1 件ずつ、直すか経緯として残すかを判断する
  - 対象自身を指す言及: 直す
  - 旧実装・試作との比較(「proto-01 と同型」等): 残す

### 5. 旧パス・旧名の参照を全体から探す

[move-path-references.md](../../rules/move-path-references.md) に従い、ディレクトリ・拡張子で絞らずに探す。

```bash
git grep -n -E "<旧名>" -- . ':!<対象外>' ':!.claude/.steering/**/_closed/**'
```

### 6. 整形と確認

```bash
npx oxfmt <変更したファイル>
git diff -U0 | grep -E '^[+-]' | grep -v -E '^(\+\+\+|---) ' | grep -v -i -E "<旧名>|<新名>"
yarn -s check-types >/dev/null 2>&1; echo "types: $?"
NEXT_PUBLIC_API_URL=http://localhost:3000 npx vitest run <対象>
```

- 2 行目で、改名と関係ない差分の行がないか確かめる
  - 名前が長くなったことによる折返しは問題ない
  - それ以外の整形差分は戻す
- 最後に `rules-reviewer` で差分を確認する([commit.md](../../rules/commit.md))

### 7. コミット

- `refactor(<scope>): <旧名> を <新名> へ改名する`
- 本文へ対応表と対象外を箇条書きで書く
