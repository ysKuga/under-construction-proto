# 決定事項（expedition のレイアウト分割）

- 2026-10-17: 親 backlog の項目「レイアウトを基本構成とデバッグ要素へ分ける」を PR #369 として着手した
  - 開閉は `<details>` で実装する（state を持たずに済むため）
  - 状態表示 content の名前は `status-panel`
