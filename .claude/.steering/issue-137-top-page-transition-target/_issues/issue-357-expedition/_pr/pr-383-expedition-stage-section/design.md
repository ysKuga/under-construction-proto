# stage-area を stage-section へ改名する

PR: #383（親: #357）

## 目的

expedition のページ直下の content `stage-area` を、命名基準に合わせて `stage-section` へ改名する。\
見た目・挙動は変えない。

## 背景・制約

- 親 backlog の項目「content と component の置き場を分ける」の 3
  - [../../backlog.md](../../backlog.md)
- 命名基準: ページ直下の content は `-section`、その中の組み合わせは `-group`
  - (../../decision-records.md 2026-10-18 content と component)
- 対象
  - ディレクトリ: `expedition/_contents/stage-area` → `stage-section`
  - コンポーネント名: `StageArea` → `StageSection`
  - 参照: `_contents/index.tsx`・`expedition/index.tsx` の JSDoc
  - `pages/CLAUDE.md` の移行状況から本項目を外す
- 対象外
  - proto-03（`_prototypes/proto-03`）の `stage-area`: 試作のため
  - rules・`components/CLAUDE.md` の経緯としての `stage-area` への言及

## 懸念・リスク

- なし
