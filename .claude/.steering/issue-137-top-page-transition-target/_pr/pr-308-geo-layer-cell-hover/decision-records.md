# 決定事項（GeoLayer のセル hover 通知）

## 2026-10-09

- payload: `{ cell: HexCell | undefined }`。`undefined` は hover 解除
- 通知方式: `Stage07-cell-hover` event（既存 `Stage07EventProvider` へ追加）
  - 当初 Context で実装。受け手が useState で持つと Provider の親ごと `Stage07` が再レンダリングされたため切替
  - event なら購読 component のみ再レンダリング。受け手側で store 化する必要もない
- 解除通知は layer（コンテナ）の `pointerleave` のみ。セル単位の leave では通知しない（セル間移動で2回通知を避ける）
