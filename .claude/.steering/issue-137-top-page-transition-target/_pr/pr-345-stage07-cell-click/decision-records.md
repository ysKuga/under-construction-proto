# 決定事項（Stage07 にセルクリック event と moveTo を追加する）

## 2026-10-16

- 移動の命令は event でなく `Stage07Handle.moveTo` とする。移動可否の結果（`boolean`）を呼出し側がその場で受け取るため。`followPath`・`warp` と並べる
- `moveTo` 単体のテストは追加しない。`useHexMove.tryMove` をそのまま公開するのみで、`tryMove` は `use-hex-move.test` でテスト済みのため（`Stage07` 全体の描画を要するテストを避ける）
