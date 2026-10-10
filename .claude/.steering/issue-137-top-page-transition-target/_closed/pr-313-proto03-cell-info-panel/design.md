# proto-03 のセル情報パネル

PR: #313（親: #137）

## 目的

- find-path proto-03 でマスをホバーした時、そのマスの内包要素をステージ外の固定パネルへ一覧表示する
- 再レンダリング量を計測し、トリガー方式（ホバー継続 / クリック固定）を確定する

## 背景・制約

- 下準備: stage-07 `GeoLayer` の `Stage07-cell-hover` 発行（[#308](../pr-308-geo-layer-cell-hover/design.md)）
  - `Stage07EventProvider` は `index.providers.tsx` でページ全体を包む。`_contents/` 直下の content から購読可
- 表示方針の検討経緯: [pr-305-cell-hover-display](../pr-305-cell-hover-display/decision-records.md)
  - 表示手段: ステージ外の固定パネル。要素が多い場合はパネル内スクロール
- 表示内容（[#305 design.md](../pr-305-cell-hover-display/design.md)「表示内容」）
  - 全 contents の一覧（term-registry の icon・名称）
  - 説明（`item-presentation.ts` の title 文言）
  - 状態（スポット残量等）
  - 操作ヒント（目標キャンセル等）
- 現状の `title` 表示: `useGetCellTitle`（`_contents/stage-area/_contents/stage/_hooks/`）
  - `getCellContents`・`describeCellContent`（`_lib/`）で組み立てる。パネルでも流用できる
- 実装方針: [high-frequency-display](../../../../../docs/performance/high-frequency-display/README.md)「ゲーム内情報の表示」
  - hover 中セルは state で持つ。state はパネル自身の中だけに置く
  - 同じセルなら `setState` しない
  - スロットル・デバウンスはまず入れない。計測してから判断する

## 懸念・リスク

- 移動中（`interactive=false`）は hover 通知不可。本 PR では対象外
- パネル表示によるレイアウト変化でステージ位置がずれないか（固定サイズで置く）
- `title` 表示との二重表示。削除は表示が固まってから判断する
