#!/usr/bin/env python3
"""ファイル先頭の import ブロックのみ oxfmt で整形する

- import の一括書換等で、既存の未整形箇所へ整形差分を出さないために使う
- 各ファイルの一時コピーへ oxfmt を当て、整形後の import ブロックだけを元ファイルへ取り込む
  - import ブロック: 先頭から最後の import 文の終わりまで
  - oxfmt の設定はカレントディレクトリの `.oxfmtrc.json` を使う(リポジトリルートで実行する)

usage: format-import-blocks.py <ファイル>...
"""

import os
import re
import shutil
import subprocess
import sys
import tempfile

IMPORT_PATTERN = re.compile(r"^import[\s\S]*?from '[^']+'\n|^import '[^']+'\n", re.M)


def split_import_block(text: str) -> tuple[str, str]:
    """import ブロックとそれ以降に分ける。import が無ければブロックは空"""
    ends = [m.end() for m in IMPORT_PATTERN.finditer(text)]

    if not ends:
        return "", text

    return text[: ends[-1]], text[ends[-1] :]


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2

    with tempfile.TemporaryDirectory() as tmp:
        for path in sys.argv[1:]:
            tmp_path = os.path.join(tmp, "x" + os.path.splitext(path)[1])
            shutil.copyfile(path, tmp_path)
            subprocess.run(["npx", "oxfmt", tmp_path], check=True, capture_output=True)

            with open(path, encoding="utf-8") as f:
                original = f.read()

            with open(tmp_path, encoding="utf-8") as f:
                formatted = f.read()

            block, _ = split_import_block(formatted)
            _, rest = split_import_block(original)

            # import ブロックの整形で差分なし: 書き込まない
            if block + rest == original:
                continue

            with open(path, "w", encoding="utf-8") as f:
                f.write(block + rest)

            print(f"updated: {path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
