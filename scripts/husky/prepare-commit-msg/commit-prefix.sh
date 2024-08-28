#!/usr/bin/env sh

readonly COMMIT_MSG_FILE=$1
readonly COMMIT_SOURCE=$2

# GitHub 向けのブランチのプレフィクス
# `{issue-}123`
GITHUB_BRANCH_PREFIX=""
# GitHub 向けのコミットログのプレフィクス
GITHUB_ISSUE_PREFIX="#"
# チケット番号のプレフィクス
# `{ISS-}123`
TICKET_PREFIX="ISS-"

# ブランチ名を取得
# https://stackoverflow.com/questions/6245570/how-to-get-the-current-branch-name-in-git#answer-12142066
branch=$(git rev-parse --abbrev-ref HEAD)
# Issue, チケットの番号
ticket_number=$(echo $branch | perl -p -e "s/
  (\d+)
  .* # チケット番号後方の文字列
  |.* # チケット番号を含まない場合すべて置換
/\$1/gx")
# GitHub 向けのブランチ中の Issue
github_issue=$(echo $branch | perl -p -e "s/
  (\d+)
  .*
  |.*
/\$1/gx")
# Jira などのチケット番号
ticket=$(echo $branch | perl -p -e "s/
  .*
  (($TICKET_PREFIX)(\d+))
  .*
  |.*
/\$1/gx")
# ブランチ自体にチケット番号が含まれているかの確認
ticket_exists=$(echo $ticket | perl -p -e "s/
  .*
  (${TICKET_PREFIX})
  .*
  |.*
/\$1/gx")

# https://zenn.dev/choimake/articles/e0865a4fac37ab
case "${COMMIT_SOURCE}" in
commit) # use -c/-C/--amend
  :     # 何もしない
  ;;
*)
  # GitHub の Issue 番号が含まれていた場合
  if [ -n "$github_issue" ]; then
    # GitHub の場合は `#` に番号を付与 (置換元は `#{Issue 番号}`)
    perl -p -i.bak -e "if (1 .. 1) { s/\A(#\d+)?\s*/${GITHUB_ISSUE_PREFIX}${ticket_number} /g }" $COMMIT_MSG_FILE
    cat $COMMIT_MSG_FILE
  fi
  # Jira などのチケット番号が含まれていた場合
  if [ -n "$ticket" ]; then
    # GitHub の場合は `#` に番号を付与
    perl -p -i.bak -e "if (1 .. 1) { s/\A(${TICKET_PREFIX}\d+)?\s*/${ticket} /g }" $COMMIT_MSG_FILE
    cat $COMMIT_MSG_FILE
  fi
  ;;
esac
