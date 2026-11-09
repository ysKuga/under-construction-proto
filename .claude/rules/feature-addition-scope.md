# 機能追加の変更範囲

新しい操作・機能（選択肢・アクション等）の追加、共有の部品・組み合わせへ props・handler を足さない。\
機能ごとの置き場で完結させ、event・登録で結び付ける。

## 機能追加 PR で変えてよいもの

- 機能の置き場（例: `_choices/<機能>/`、`_events/_event-listeners/use-xxx-event-listener/`）
- 有効化する場所の 1 行（例: `ExpeditionChoices`、`ExpeditionEventListeners`）
- event の型（`_events/index.types.ts`）への追記
  - 並行作業で衝突しやすい。既存の event で足りるなら追記しない
- 移設に伴う旧実装の削除（例: 吹き出しから選択肢へ移した時の吹き出し）
  - 追加とコミットを分ける（追加 → 削除の順）

## 禁止

共有の部品・組み合わせへ、機能固有の値・handler を足す。

- props
- 部品 hook の引数
- `Use<Component>Return` の型

足したくなった時点で、登録・event の形へ設計し直す（[event-binding-design](../skills/event-binding-design/SKILL.md)）。

## 着手前

変わる既存ファイルを一覧にして提示する。

- 上記「変えてよいもの」以外を含む場合、仕組みの改修として別 PR へ切り出す（[pr.md](pr.md)「粒度」）

## 例

expedition の選択肢パネル（PR #412）。

- 選択肢の追加で変わるもの
  - `_choices/<機能>/`
  - `_choices/index.tsx` の 1 行
- パネル・組み合わせは、選択肢の一覧（store）の購読と、選択の event（`Expedition-choice-select`）の発行のみ持つ

## 理由

PR #411 で、EN の選択肢の handler を部品 hook の引数・`UseChoicePanelContentReturn` へ足した。

- 選択肢 1 つの追加で、組み合わせの型・ベース hook・部品 hook が変わった
- #410・#411 とも約 20 ファイル変更。並行作業・確認が難しくなった
- 同じ指摘（props で機能を足す）が以前の開発でも繰り返されていた

移設に伴う旧実装の削除は、作り直した PR #411 で吹き出しの削除を同じ PR に含めた際に足した。
