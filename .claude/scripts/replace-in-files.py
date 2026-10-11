#!/usr/bin/env python3
"""複数ファイルの文字列を一括置換する

- 置換対象の文字列が見つからないファイルがあれば、どのファイルも書き換えずに失敗する
- 一致箇所はすべて置換する
- 置換指定は JSON で渡す: {"<パス>": [["<置換前>", "<置換後>"], ...], ...}
  - パスはカレントディレクトリからの相対パスまたは絶対パス
  - 同一ファイル内の置換は記述順に適用する(前の置換結果に対して次を照合する)

usage: replace-in-files.py <JSON ファイル | ->   (- は標準入力)
"""

import json
import sys


def load_spec(source: str) -> dict[str, list[list[str]]]:
    if source == "-":
        return json.load(sys.stdin)

    with open(source, encoding="utf-8") as f:
        return json.load(f)


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2

    spec = load_spec(sys.argv[1])
    results: dict[str, str] = {}
    errors: list[str] = []

    for path, pairs in spec.items():
        with open(path, encoding="utf-8") as f:
            text = f.read()

        for old, new in pairs:
            if old not in text:
                errors.append(f"{path}: not found: {old[:80]!r}")
                continue

            text = text.replace(old, new)

        results[path] = text

    if errors:
        print("\n".join(errors), file=sys.stderr)
        print("no files were written", file=sys.stderr)
        return 1

    for path, text in results.items():
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"updated: {path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
