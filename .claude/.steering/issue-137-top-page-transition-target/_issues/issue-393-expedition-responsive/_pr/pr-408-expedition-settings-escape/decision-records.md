# 決定事項（設定ポップオーバーの Esc の `useKeyLayer` への統一）

- 2026-10-25: `popover="auto"` のまま、Esc の閉じを `useKeyLayer` の層へ載せる
  - 手段: 層がキーを処理したら `preventDefault()` し、ブラウザ標準の閉じを止める
  - 理由: `manual` にすると外側クリックで閉じる挙動が無くなる
  - ピン留め中: 層を積まない（従来どおり Esc で閉じない）
