# Stage05

stage-04 を土台に、CSS 2D の scale 補間で遠近表現を追加。

## 流用と差分

- `ActorPositionProvider` / `MoveIntentEvent` / `resolveMoveIntent` は stage-04 から import してそのまま利用。
- 差し替えは「グリッド座標 → 画面座標」の投影のみ。`_lib/perspective.ts` の `projectCell` へ集約。
- `GeoLayer` は投影関数を参照する形で stage-05 側に再実装（sibling import は避け、`_lib` を一方向参照）。
- actor 表示（`ActorsLayer` / `useKeyboardMove` 相当）は現時点で未搭載。find-path 段階 2 で box-bot を載せる。

## 遠近モデル

- 最奥行 (row 0) を `depthScale` 倍、最前行 (row rows-1) を等倍として線形補間。
- 各行は水平中央揃え。縦は各行のセル高を奥から積み上げ、隙間なくタイル状に並べる（奥ほど行が薄くなる）。
- `height` は描画領域の箱の高さのみに使用。積み上げ結果が `height` に満たなくても下側が余るだけ。
- `ProjectedCell.scale` は現在行の縮尺。段階 2 で actor（box-bot）の大きさ追従に使う。

## z-index / 描画順

- 奥の行から順に描画し、手前のセルを DOM 上で後勝ちにする。z-index は使わない。
- actor（段階 2 で追加）は `GeoLayer` の後に置き、地形より前面に出す（stage-04 踏襲）。
- 複数 actor / 障害物どうしの前後関係（row 昇順ソート）は未対応。find-path 段階 4 で扱う。

## 未対応

- `perspective` / `rotateX` による本格的な床面の傾き表現は不採用（実装コスト・three.js 合成の都合）。
- 遠近に伴うクリック判定の歪み補正なし（各セルは投影後の矩形ボタンをそのまま使用）。
