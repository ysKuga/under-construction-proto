# マスホバー時の表示

issue: #137 / PR: #305（backlog「マスホバー/選択時の内包要素一覧表示を検討」）

## 目的

- find-path proto-03 でマスをホバーした際、そのマスに存在する要素（障害物・EN 補給アイテム・EN スポット等）を把握できるようにする

## 背景・制約

- マス上オブジェクトは現状絵文字表示のみ。ホバーしても内容が分からない（[design.md](../../design.md) 懸念・リスク）
- マス上オブジェクトへ `ui-term-` プレフィクスの className を付与済み
  - className を参照する hover 表示の仕組み自体は未着手
  - 汎用方針は [docs/concept/ideas](../../../../../docs/concept/ideas/README.md)「ユーザビリティ・用語説明」参照
- 用語情報の集約案: [term-registry](../../../../../docs/concept/ideas/term-registry/README.md)

## 現状

- hover 表示は `GeoLayer` セル `<button>` の `title` 属性のみ
  - 実体: proto-03 `useGetCellTitle`（`CellTitleProvider` 経由で注入）
- stage-07 に hover を外部へ通知する口がない（`onCellClick` のみ）
- floor は `rotateX` の 3D 空間

## 表示内容

- 全 contents の一覧（term-registry の icon・名称）
- 説明（`item-presentation.ts` の title 文言）
- 状態（スポット残量等）
- 操作ヒント（目標キャンセル等、現 `title` 先頭の文言）

## 懸念・リスク

- `title` 表示は `contents[0]` のみ。複数要素あるマスで2件目以降が出ない
- hover による再レンダリング量（仮実装で計測）
- 移動中（`interactive=false`）は `pointerEvents: none`、hover 不可
  - 3D ヒットテスト対策（issue #181 PR-C）
