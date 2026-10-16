# 実装計画（通れない隣接マスのクリックを目標設定にする）

- [ ] `useHexMove.handleCellClick` で直接移動できなかったクリックを呼出し側へ委ねる
  - テスト先行
- [ ] `onNonAdjacentClick` を `onIndirectClick` へリネームする
  - proto-03 のハンドラ・ファイル名も合わせる
