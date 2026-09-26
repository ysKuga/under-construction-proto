# 決定事項（proto-03 の独立 bot 横へステージ上の bot の向きを示す矢印を表示する）

- 2026-09-26: 向きの表示は独立 bot を回さず、別途矢印で示す
- 2026-09-26: 矢印は中心回転案を採用する
  - 半径端案（基準 hex の外側を周回）も部品として残す
- 2026-09-26: 矢印の格納先を `src/components/theater/stage/spike/` とする
  - spike（場ミリ）: stage 上の actor の位置・向き等を示す目印の区分（[docs/terminology/theater/stage/spike/](../../../../../../../docs/terminology/theater/stage/spike/README.md)）
  - `ui/` はシステム・ゲーム全般で使う想定のため、ゲームの要素としての性格が強い矢印は `theater/` 配下とする
  - 不採用
    - `set`（舞台装置）: 地形（`geo`）との境界が曖昧になる
    - `cue`（きっかけ）: goal-marker 等の目的地の目印と意味が合わない
    - `props`（小道具）: React の props と衝突する
