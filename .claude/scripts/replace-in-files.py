#!/usr/bin/env python3
"""複数ファイルの文字列を一括置換する

- 置換対象の文字列が見つからないファイルがあれば、どのファイルも書き換えずに失敗する
- 置換指定は JSON で渡す: {"<パス>": [<置換>, ...], ...}
  - パスはカレントディレクトリからの相対パスまたは絶対パス
  - 同一ファイル内の置換は記述順に適用する(前の置換結果に対して次を照合する)
- 置換は2形式
  - ["<置換前>", "<置換後>"]: 完全一致の文字列置換。一致箇所はすべて置換する
  - {"start": "<開始>", "end": "<終了>", "new": "<置換後>"}: 範囲置換
    - 開始の目印から終了の目印の直前までを置換後の文字列へ差し替える(開始は含み、終了は含まない)
    - 終了は開始より後ろで最初に一致した箇所
    - 終了を省略するとファイル末尾までを差し替える
    - 開始が複数箇所に一致する場合は曖昧なため失敗する
    - 範囲の削除は "new": ""

usage: replace-in-files.py <JSON ファイル | ->   (- は標準入力)
"""

import json
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

        for replacement in pairs:
            if isinstance(replacement, dict):
                text, error = replace_range(text, replacement)

                if error:
                    errors.append(f"{path}: {error}")

                continue

            old, new = replacement

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
