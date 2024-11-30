# ヘルプについて
# https://ktrysmt.github.io/blog/write-useful-help-command-by-shell/

.DEFAULT_GOAL := help

help: ## print this message
	@echo "Example operations by makefile."
	@echo ""
	@echo "Usage: make SUB_COMMAND argument_name=argument_value"
	@echo ""
	@echo "Command list:"
	@echo ""
	@printf "\033[36m%-30s\033[0m %-50s %s\n" "[Sub command]" "[Description]" "[Example]"
	@grep -E '^[/a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | perl -pe 's%^([/a-zA-Z_-]+):.*?(##)%$$1 $$2%' | awk -F " *?## *?" '{printf "\033[36m%-30s\033[0m %-50s %s\n", $$1, $$2, $$3}'

# Makefile についてのメモ
# https://gist.github.com/ysKuga/d1c699330cb275a3395dd239120013e3

# 以下スクリプトにより package.json より記述を生成
# scripts=$(jq -r '.["scripts"] | keys | .[]' <package.json)
# for script in $scripts; do
#   echo "${script}:"
#   echo "\tyarn ${script}"
#   echo
# done

build:
	yarn build

build-storybook:
	yarn build-storybook

check-types:
	yarn check-types

dev:
	yarn dev

generate:
	yarn generate

lint:
	yarn lint

prepare:
	yarn prepare

run-mock-server:
	yarn run-mock-server

start:
	yarn start

storybook:
	yarn storybook

test:
	yarn test

test-e2e:
	yarn test-e2e
