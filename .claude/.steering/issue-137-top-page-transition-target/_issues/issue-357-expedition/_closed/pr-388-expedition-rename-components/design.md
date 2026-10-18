# expedition のコンポーネント名を FindPathProto03 から Expedition へ改名する

PR: #388（親: #357）

## 目的

expedition 本体のコンポーネント名を、ページ名 `expedition` に合わせて改名する。\
見た目・挙動は変えない。

## 背景・制約

- 親 backlog の項目「`expedition` に合わせて改名する」の後半
  - [../../backlog.md](../../backlog.md)
  - 前半（event 名）は PR #385 で改名済み
- 改名は本実装のみ。prototypes は `find-path` のまま
  - (../../../../decision-records.md 2026-10-17 名前)
- 対象: `expedition` 直下の `index.tsx`・`index.providers.tsx`・`index.stories.tsx`・`index.types.ts`・`_contents/index.tsx`
  - コンポーネント: `FindPathProto03` → `Expedition`
  - `FindPathProto03Providers`・`FindPathProto03Contents` → `ExpeditionProviders`・`ExpeditionContents`
  - 型: `FindPathProto03Props`・`FindPathProto03ProvidersProps` → `ExpeditionProps`・`ExpeditionProvidersProps`
  - 上記の識別子を指すコメント
- 対象外
  - `expedition/_prototypes` 配下
  - `hex-stage`・`_stores/energy` 内のコメント（親 backlog の別項目）
  - 識別子でない `proto-03`・`find-path` への言及（コメントの文中）

## 懸念・リスク

- なし
