# 目標セル側の bubble 表示

issue: #137 / PR: #259（backlog「目標を設定した際に、bot と同様の bubble を目標側にも表示することを検討する」）

## 目的

- 目標セル側にも bot と同じ bubble（中継点・実行）を表示する
- 目標が遠距離にあっても、カーソルを bot まで戻さず bubble を操作できるようにする

## 背景・制約

- bubble は bot 用オーバーレイコンテナ（`Stage07` の `ActorOverlayLayer`）へ `createPortal` で注入している
  - コンテナは floor の 3D 空間外にあり、アンカー（floor 内の DOM）の画面上の位置へ rAF で追従する
  - floor 内へ直接置くと tilt の影響を受け、奥行きヒットテストで `GeoLayer` のセルにクリックを奪われる
- 目標セルは actor でないため、専用のコンテナがない

実装計画: [backlog.md](backlog.md)

## 方針

- 表示する bubble: 中継点・実行の両方
  - bot 側と同じ waypoint-flow store を参照し、状態（選択モード・半透明化）を同期する
- 表示条件: 経路提示中（`flowState !== 'idle'`）は常に bot 側・目標側の両方へ表示する
- 追従コンテナ: actors store の overlay anchor を流用する
  - `ObjectiveMarkerLayer` が目標セルにアンカーを置き、擬似 id（`objective`）で `registerOverlayAnchor` へ登録する
  - `ActorOverlayLayer` がコンテナを用意・追従させる。`Stage07` は変更しない
  - アンカーは bot の位置決め div と同じ大きさ・tilt 打消しにし、bubble の `offset`（bot 基準）をそのまま使えるようにする
  - actor でないものを actors store へ載せることになる。他にも必要になった時点で stage-07 側の汎用化を検討する

## 決定事項

- 目標側の表示は距離によらず常時とする（しきい値判定は行わない、単純さ優先）
- stage-07 へ汎用 cell overlay は新設しない（変更範囲を proto-03 に閉じる）

## 懸念・リスク

- 目標が bot から 2 マスの場合、両側の bubble が近接・重なる可能性（実ブラウザで確認）
