#!/usr/bin/env sh

npx lefthook install

# .env.<service>.example から .env.<service> を用意する(既存ファイルは上書きしない)
for example in .env.*.example; do
  [ -e "$example" ] || continue
  target="${example%.example}"
  [ -f "$target" ] || cp "$example" "$target"
done
