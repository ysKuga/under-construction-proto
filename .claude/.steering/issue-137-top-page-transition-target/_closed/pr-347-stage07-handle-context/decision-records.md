# 決定事項（Stage07 の handle context と隣接クリック移動 component を用意する）

## 2026-10-16

- 単体の `Stage07` での隣接クリック移動は、handle を context で配り、`Stage07-cell-click` を購読する component で補う（ユーザー判断）。prop による組込み移動の切替は、`Stage07` 内に分類が残るため不採用
- 下準備（context 昇格・component 追加）と本対応（組込み移動の廃止・listener 集約）を別 PR に分ける（#347 → #346）
