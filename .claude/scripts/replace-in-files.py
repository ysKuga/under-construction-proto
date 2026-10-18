#!/usr/bin/env python3
"""複数ファイルの文字列を一括置換する

- 置換対象の文字列が見つからないファイルがあれば、どのファイルも書き換えずに失敗する
- 置換指定は JSON で渡す: {"<パス>": [<置換>, ...], ...}
  - パスはカレントディレクトリからの相対パスまたは絶対パス
  - 同一ファイル内の置換は記述順に適用する(前の置換結果に対して次を照合する)
  - パスに glob(`*`/`?`/`[`、`**` で再帰)を含む場合、一致した全ファイルへ同じ置換を適用する
    - 置換対象が見つからないファイルは飛ばす。一致したファイルが1つも無い置換のみ失敗する
  - `!` で始まるキーは除外の glob。全ての glob 指定の一致から、除外に一致するファイルを外す
    - 値は空配列: {"!src/a/_prototypes/**": []}
    - glob を含まないパス指定には効かない
- 置換は3形式
  - ["<置換前>", "<置換後>"]: 完全一致の文字列置換。一致箇所はすべて置換する
  - {"start": "<開始>", "end": "<終了>", "new": "<置換後>"}: 範囲置換
    - 開始の目印から終了の目印の直前までを置換後の文字列へ差し替える(開始は含み、終了は含まない)
    - 終了は開始より後ろで最初に一致した箇所
    - 終了を省略するとファイル末尾までを差し替える
    - 開始が複数箇所に一致する場合は曖昧なため失敗する
    - 範囲の削除は "new": ""
  - {"regex": "<正規表現>", "repl": "<置換後>"}: 正規表現置換(re.sub)。一致箇所はすべて置換する
    - 置換後では \\1 等の後方参照を使える

usage: replace-in-files.py <JSON ファイル | ->   (- は標準入力)
"""

import glob
import json
import re
import sys

Replacement = list[str] | dict[str, str]


def load_spec(source: str) -> dict[str, list[Replacement]]:
    if source == "-":
        return json.load(sys.stdin)

    with open(source, encoding="utf-8") as f:
        return json.load(f)


def replace_range(text: str, replacement: dict[str, str]) -> tuple[str, str | None]:
    """開始の目印から終了の目印の直前までを差し替える。失敗時は元の text とエラー内容を返す"""
    start, end, new = replacement["start"], replacement.get("end"), replacement["new"]
    start_index = text.find(start)

    if start_index == -1:
        return text, f"start not found: {start[:80]!r}"

    if text.count(start) > 1:
        return text, f"start is ambiguous: {start[:80]!r}"

    # 終了の省略: ファイル末尾までを差し替える
    if end is None:
        return text[:start_index] + new, None

    end_index = text.find(end, start_index + len(start))

    if end_index == -1:
        return text, f"end not found after start: {end[:80]!r}"

    return text[:start_index] + new + text[end_index:], None


def apply(text: str, replacement: Replacement) -> tuple[str, str | None]:
    """置換を1つ適用する。失敗時は元の text とエラー内容を返す"""
    if isinstance(replacement, dict) and "regex" in replacement:
        new_text, count = re.subn(replacement["regex"], replacement["repl"], text)

        return (new_text, None) if count else (text, f"regex not found: {replacement['regex'][:80]!r}")

    if isinstance(replacement, dict):
        return replace_range(text, replacement)

    old, new = replacement

    if old not in text:
        return text, f"not found: {old[:80]!r}"

    return text.replace(old, new), None


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2

    spec = load_spec(sys.argv[1])
    excluded = {
        path
        for pattern in spec
        if pattern.startswith("!")
        for path in glob.glob(pattern[1:], recursive=True)
    }
    texts: dict[str, str] = {}
    changed: set[str] = set()
    errors: list[str] = []

    for pattern, replacements in spec.items():
        # 除外の指定: 置換対象ではない
        if pattern.startswith("!"):
            continue

        is_glob = glob.has_magic(pattern)
        paths = (
            sorted(set(glob.glob(pattern, recursive=True)) - excluded)
            if is_glob
            else [pattern]
        )

        if is_glob and not paths:
            errors.append(f"{pattern}: no files matched")
            continue

        for path in paths:
            if path not in texts:
                with open(path, encoding="utf-8") as f:
                    texts[path] = f.read()

        for replacement in replacements:
            matched = False

            for path in paths:
                text, error = apply(texts[path], replacement)

                if error is None:
                    texts[path] = text
                    changed.add(path)
                    matched = True
                # glob 指定: 対象外のファイルとして飛ばす
                elif not is_glob:
                    errors.append(f"{path}: {error}")

            # glob 指定でどのファイルにも一致しない: 指定誤りとして失敗する
            if is_glob and not matched:
                errors.append(f"{pattern}: not found in any file: {replacement!r:.80}")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        print("no files were written", file=sys.stderr)
        return 1

    for path in sorted(changed):
        with open(path, "w", encoding="utf-8") as f:
            f.write(texts[path])

        print(f"updated: {path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
