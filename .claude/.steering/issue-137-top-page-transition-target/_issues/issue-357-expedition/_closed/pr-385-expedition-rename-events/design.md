# expedition の event 名を FindPath から Expedition へ改名する

PR: #385（親: #357）

## 目的

expedition 本体の event 名を、ページ名 `expedition` に合わせて改名する。\
見た目・挙動は変えない。

## 背景・制約

- 親 backlog の項目「`expedition` に合わせて改名する」の前半
  - [../../backlog.md](../../backlog.md)
  - 後半（`FindPathProto03*` のコンポーネント名）は別 PR
- 改名は本実装のみ。prototypes は `find-path` のまま
  - (../../../../decision-records.md 2026-10-17 名前)
- 対象: `expedition/_events` と参照元
  - event key: `FindPath-xxx` → `Expedition-xxx`
  - 型・コンポーネント: `FindPathEvent*` → `ExpeditionEvent*`
  - 変数: `findPathEventDispatcher`・`findPathDispatch` → `expedition*`
  - ファイル: `use-find-path-event-*.ts` → `use-expedition-event-*.ts`
- 対象外
  - `expedition/_prototypes` 配下
  - `hex-stage`・`_stores/energy` 内のコメント（親 backlog の別項目）

## 懸念・リスク

- なし
