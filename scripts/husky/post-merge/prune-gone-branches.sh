#!/usr/bin/env bash

# リモートで削除済のブランチをローカルからも削除する
git fetch --prune

git branch -vv | grep ': gone]' | awk '{print $1}' | while read -r branch; do
  git branch -d "$branch"
done
