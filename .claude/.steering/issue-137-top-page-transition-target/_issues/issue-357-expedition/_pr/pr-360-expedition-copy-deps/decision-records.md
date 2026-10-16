# 決定事項（expedition への依存先のコピー）

- 2026-10-17: コピー先を決めた
  - stage-07: expedition 配下（theater/stage への汎用化は見送り）
  - stage-06/constants・time-control-03/types: stage のコピー先へ同梱（`src/types` 等の共通置き場は使わない）
  - stage-07 が `stage-05/_hooks/use-perspective-control` にも依存するため、コピー対象へ追加した
