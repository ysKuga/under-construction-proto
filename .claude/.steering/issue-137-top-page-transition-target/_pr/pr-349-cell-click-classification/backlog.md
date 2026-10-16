# 実装計画（セルクリックの pointer 判定を listener の分類へ揃える）

- [ ] `classifyCellClick` を純粋関数として追加し、テストを書く
- [ ] `useCellClickEventListener` を分類で分岐する形へ置き換える
- [ ] `Stage07` に `isCellSelectable` prop を追加する（省略時は現在セル以外）
- [ ] proto-03 から分類に基づく `isCellSelectable` を渡す
  - 依存は `currentCell` のみ
