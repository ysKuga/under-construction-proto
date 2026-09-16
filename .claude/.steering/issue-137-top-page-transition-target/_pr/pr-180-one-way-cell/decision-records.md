# 決定事項（一方通行セル）

- 2026-09-16: 意味論は「退出方向固定型」(ベルトコンベア型)。セルに「出られる方向」を1つ持たせる。矢印表示がそのセル自体に乗るため見た目が直感的で、「進入方向制限型」(門型)より実装・視覚表現ともシンプル
- 2026-09-16: 逆方向進入時は「選択拒否」。障害物セル(`isObstacleCell`)と同じUX ― `PlannedPathLayer` でボタンを disabled + cursor `not-allowed` にする。判定は隣接ペア(直前セル→対象セル)の向きと退出方向を比較する
- 2026-09-16: proto-03(hex)は6方向のため矢印絵文字の出し分け不採用、単一矢印を `hexDirectionToScreenAngle` の画面角度で CSS rotate する方式にした。選択拒否は proto-01(`PlannedPathLayer` disabled)と異なり `Stage07` の `canEnterCell` prop（`useHexMove` 組込み）に集約、直前セルは呼び出し元の `currentCell` state を使う
