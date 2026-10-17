# 決定事項（expedition への proto-03 本体のコピー）

- 2026-10-17: コピー先・追加対象を決めた
  - proto-03 本体: `expedition/` 直下
  - `energy-debug-panel`: `expedition/_components/`（構成を変えないため、ネストの見直しは後続へ委ねる）
- 2026-10-17: コピー時の調整
  - コピーと import 書換をコミットで分けた
  - 整形は import ブロックのみ（既存の未整形箇所はコピー元のまま）
  - store を _stores へ合流したため、集約 index（_types・_constants）へ re-export を追加した
  - story は title 未指定のためパスから ID が決まり、コピー元と重複しない
  - タイトル等の表示文言（`Find Path (proto-03 / hex)`）は改名項目へ委ね、そのまま残した
