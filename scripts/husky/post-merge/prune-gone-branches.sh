#!/usr/bin/env bash

# リモートで削除済のブランチをローカルからも削除する
git branch -vv | grep ': gone]' | awk '{print $1}' | while read -r branch; do
  git branch -d "$branch"
done
