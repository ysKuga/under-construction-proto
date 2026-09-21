# ts-pattern

<https://github.com/gvergnaud/ts-pattern>

## 概要

TypeScript 向けの型安全なパターンマッチングライブラリ。

- `match(value).with(pattern, handler)...` の形で分岐を記述し、型を絞り込みながらハンドラを実行する。
- `if`/`switch` の否定条件・フラグの真偽が並ぶ分岐（例: `outOfEnergyRef.current` の true/false 判定）を、値そのものへのパターンとして明示することで読み違いを減らす目的で導入（issue-181-en）。
- `.exhaustive()` を付けると、パターンの網羅漏れをコンパイルエラーで検知できる。

## バージョン注意

- v5 系（`ts-pattern@5`）。特筆すべき peer dependency 制約はない。
