# 決定事項（proto-03 のセル情報パネル）

## 2026-10-10

- 下準備 #308 の close と同じブランチで着手する
- パネル配置: 当初 `fixed` で右上 → ステージ直下・同じ幅へ変更（`stage-area/_contents/cell-info-panel`）。高さ固定でレイアウトをずらさない
- 同じセルの判定: 前回値を ref で比べ `setState` を呼ばない
  - updater で前の値を返す形では、React が bailout 前に1度描画した（テストで確認）
- 再レンダリング計測（Storybook、全25セル走査 + 解除）: 描画されたのは `CellInfoPanel` のみ、セル移動1回につき1回
  - トリガー: ホバー継続で確定。クリック固定・スロットル・デバウンスは不要
- `title` 表示（`useGetCellTitle`・stage-07 `CellTitleProvider`）を削除。パネルで代替
  - 目標キャンセルの操作ヒントはパネル側（`OBJECTIVE_CANCEL_HINT`）へ移す
- 表示対象へ bot（EN 残量付き）・ゴール（到達状況付き）を追加。並び: bot → ゴール → 障害物・アイテム
  - bot の EN は bot が hover 中セルにいる時のみ購読値を返す（無関係な EN 変化で再レンダリングさせない）
  - 表示要素は今後も増える想定。`CellInfoEntry` の配列へ追加する形で拡張する
