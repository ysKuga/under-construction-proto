#!/usr/bin/env python3
"""steering ディレクトリを git mv し、移動で壊れる相対リンクを書き換える

- 対象: リポジトリ管理下の全 .md ファイル
  - 移動先を指すリンク(他ファイル → 移動対象)
  - 移動対象内から外を指すリンク(階層の深さが変わる場合)
- リンク先が実在しないリンクは触らない(元から壊れているもの・プレースホルダ等)

usage: move-and-relink.py <移動元> <移動先> [--dry-run]
"""

import os
import re
import subprocess
import sys

LINK_RE = re.compile(r"(\]\()([^)\s]+)(\))")
SKIP_PREFIXES = ("http://", "https://", "mailto:", "#", "/")


def remap(path: str, src: str, dst: str) -> str:
    """移動元配下のパスを移動先配下へ写す。配下でなければそのまま"""
    if path == src or path.startswith(src + os.sep):
        return dst + path[len(src):]
    return path


def rewrite(text: str, file_orig: str, file_new: str, src: str, dst: str) -> str:
    def replace(m: re.Match) -> str:
        link = m.group(2)
        if link.startswith(SKIP_PREFIXES):
            return m.group(0)
        path, sep, anchor = link.partition("#")
        if not path:
            return m.group(0)
        target_orig = os.path.normpath(os.path.join(os.path.dirname(file_orig), path))
        # 元から壊れているリンクは対象外
        if not os.path.exists(target_orig):
            return m.group(0)
        target_new = remap(target_orig, src, dst)
        if target_new == target_orig and file_new == file_orig:
            return m.group(0)
        new_path = os.path.relpath(target_new, os.path.dirname(file_new))
        if path.endswith("/") and not new_path.endswith("/"):
            new_path += "/"
        return f"{m.group(1)}{new_path}{sep}{anchor}{m.group(3)}"

    return LINK_RE.sub(replace, text)


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry_run = "--dry-run" in sys.argv
    if len(args) != 2:
        sys.exit(__doc__)
    src, dst = (os.path.normpath(a) for a in args)
    if not os.path.isdir(src):
        sys.exit(f"移動元がディレクトリでない: {src}")
    if os.path.exists(dst):
        sys.exit(f"移動先が既に存在する: {dst}")

    files = subprocess.run(
        ["git", "ls-files", "*.md"], capture_output=True, text=True, check=True
    ).stdout.split()

    # 移動前のパスで解決し、書換後の内容を移動後のパスへ対応付ける
    updates: dict[str, str] = {}
    for f in files:
        with open(f, encoding="utf-8") as fp:
            text = fp.read()
        f_new = remap(f, src, dst)
        new_text = rewrite(text, f, f_new, src, dst)
        if new_text != text:
            updates[f_new] = new_text
            if dry_run:
                for old_line, new_line in zip(text.splitlines(), new_text.splitlines()):
                    if old_line != new_line:
                        print(f"{f_new}\n  - {old_line.strip()}\n  + {new_line.strip()}")

    if dry_run:
        print(f"[dry-run] git mv {src} {dst} / リンク書換 {len(updates)} ファイル")
        return

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["git", "mv", src, dst], check=True)
    for f, text in updates.items():
        with open(f, "w", encoding="utf-8") as fp:
            fp.write(text)
    print(f"git mv {src} {dst} / リンク書換 {len(updates)} ファイル")
    for f in sorted(updates):
        print(f"  {f}")


if __name__ == "__main__":
    main()
