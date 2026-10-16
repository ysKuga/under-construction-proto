# 決定事項（Stage07 にセルクリック event と moveTo を追加する）

## 2026-10-16

- 移動の命令は event でなく `Stage07Handle.moveTo` とする。移動可否の結果（`boolean`）を呼出し側がその場で受け取るため。`followPath`・`warp` と並べる
