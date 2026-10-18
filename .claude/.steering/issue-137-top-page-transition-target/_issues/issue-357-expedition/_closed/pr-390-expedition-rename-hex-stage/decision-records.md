# 決定事項（expedition の Stage07 を HexStage へ改名する）

- 2026-10-18（範囲）: コメントだけでなく識別子・event key も改名する
  - ファイル名 `stage07-handle` 等が識別子 `Stage07Handle` 等と対応するため、ファイル名だけ変えると名前がずれる
  - 識別子の改名（本 PR）とコメントの見直し（別 PR）で PR を分ける
  - 改名先は `hex-stage` に合わせて `HexStage`
