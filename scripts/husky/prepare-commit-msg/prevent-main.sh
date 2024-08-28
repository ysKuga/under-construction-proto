#!/usr/bin/env bash

# ブランチ名を取得
# https://stackoverflow.com/questions/6245570/how-to-get-the-current-branch-name-in-git#answer-12142066
branch=$(git rev-parse --abbrev-ref HEAD)

# コミット禁止対象 `|` で結合して複数指定する
forbidden="main"

if [[ "$branch" =~ $forbidden ]]; then
  echo "${forbidden} へのコミットは禁止されています"
  exit 1
fi
