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

## 検討事項

- 表示手段
  - `title` 属性による暫定表示
  - マス単位の内包要素一覧（ホバー・選択時）
- 表示のトリガー
  - ホバー（マウス操作）
  - 選択（タッチ操作ではホバーがないため）
- 既存の bubble（`BubbleSlots`）・目標設定の操作との干渉

## 実装計画

- [ ] 表示手段・トリガーを決める
