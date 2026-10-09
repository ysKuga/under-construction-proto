#!/usr/bin/env python3
"""指定ブランチ上の Claude Code セッションログを振り返り用に要約して出力する

- 対象: ~/.claude/projects/<リポジトリパス由来>/*.jsonl のうち gitBranch が一致するエントリ
- 出力: セッションごとの時系列
  - U: ユーザー発言(IDE 由来のタグ・system-reminder 除去)
  - T: ツール呼出(Bash はコマンド、Skill/Agent は名前、Edit/Write はパス)
  - E: エラーになったツール結果(許可拒否・失敗)
- 末尾に Bash コマンド先頭語・Skill・Agent の使用回数

usage: extract-branch-log.py <branch> [プロジェクトログのディレクトリ]
"""

import collections
import glob
import json
import os
import re
import subprocess
import sys

TAG_RE = re.compile(r"<(ide_opened_file|ide_selection|system-reminder)>.*?</\1>", re.S)
MAX_TEXT = 400


def default_log_dir() -> str:
    root = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True
    ).stdout.strip()
    return os.path.expanduser(f"~/.claude/projects/{re.sub(r'[^A-Za-z0-9]', '-', root)}")


def short(text: str, limit: int = MAX_TEXT) -> str:
    text = " / ".join(line.strip() for line in text.strip().splitlines() if line.strip())
    return text if len(text) <= limit else text[:limit] + "…"


def command_head(command: str) -> str:
    """連結コマンドのうち cd・変数代入を除いた最初のコマンド名"""
    for part in re.split(r"&&|\|\||;|\n", command):
        words = [w for w in part.split() if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", w)]
        if words and words[0] != "cd":
            return words[0]
    return "cd"


def describe_tool(item: dict) -> str:
    name, args = item["name"], item.get("input", {})
    if name == "Bash":
        return f"Bash: {short(args.get('command', ''), 200)}"
    if name == "Skill":
        return f"Skill: {args.get('skill')} {args.get('args', '')}".rstrip()
    if name == "Agent":
        return f"Agent: {args.get('subagent_type', 'general-purpose')} ({args.get('description', '')})"
    if "file_path" in args:
        return f"{name}: {args['file_path']}"
    return name


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    branch = sys.argv[1]
    log_dir = sys.argv[2] if len(sys.argv) > 2 else default_log_dir()

    counts: dict[str, collections.Counter] = collections.defaultdict(collections.Counter)
    for path in sorted(glob.glob(os.path.join(log_dir, "*.jsonl")), key=os.path.getmtime):
        lines: list[str] = []
        for raw in open(path, encoding="utf-8"):
            try:
                entry = json.loads(raw)
            except json.JSONDecodeError:
                continue
            # 他ブランチ・サブエージェント内・skill 本文等の自動挿入は対象外
            if entry.get("gitBranch") != branch or entry.get("isSidechain") or entry.get("isMeta"):
                continue
            content = (entry.get("message") or {}).get("content")
            items = [{"type": "text", "text": content}] if isinstance(content, str) else content or []
            for item in items:
                if not isinstance(item, dict):
                    continue
                kind = item.get("type")
                if entry["type"] == "user" and kind == "text":
                    text = TAG_RE.sub("", item["text"]).strip()
                    if text:
                        lines.append(f"U: {short(text)}")
                elif entry["type"] == "user" and kind == "tool_result" and item.get("is_error"):
                    result = item.get("content")
                    if isinstance(result, list):
                        result = " ".join(x.get("text", "") for x in result if isinstance(x, dict))
                    lines.append(f"E: {short(str(result), 200)}")
                elif entry["type"] == "assistant" and kind == "tool_use":
                    lines.append(f"T: {describe_tool(item)}")
                    args = item.get("input", {})
                    if item["name"] == "Bash" and args.get("command"):
                        counts["Bash"][command_head(args["command"])] += 1
                    elif item["name"] in ("Skill", "Agent"):
                        counts[item["name"]][args.get("skill") or args.get("subagent_type")] += 1
        if lines:
            print(f"## session {os.path.basename(path)[:8]}")
            print("\n".join(lines))
            print()

    if not counts:
        print(f"branch {branch} のログなし ({log_dir})")
        return
    print("## counts")
    for name, counter in counts.items():
        print(f"{name}: " + ", ".join(f"{k}={v}" for k, v in counter.most_common(15)))


if __name__ == "__main__":
    main()
