# 実装計画（セルクリックの判定を find-path の listener へ集約する）

- [ ] proto-03 に `useCellClickEventListener` を追加し、`useHandleIndirectClick` を置き換える
  - テスト: 現在マス・移動・目標の再クリック・EN 拒否・提示
- [ ] Stage07 から `onIndirectClick`・`handleCellClick`・`GeoLayer.onCellClick` を廃止する
- [ ] stage-07 の story へ `MoveOnAdjacentCellClick` を置く
  - Storybook で隣接クリック移動を確認する
- [ ] proto-03 の動作確認（隣接移動・目標設定・再クリックのキャンセル）
