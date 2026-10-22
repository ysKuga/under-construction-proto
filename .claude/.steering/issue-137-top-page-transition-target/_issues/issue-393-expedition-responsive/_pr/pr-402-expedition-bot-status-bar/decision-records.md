# 決定事項（expedition のスマホの幅で bot の状態表示を横一列のバーにする）

- 2026-10-22: 親の方針（横一列のバー）を本 PR で実装する
  - (../../decision-records.md 2026-10-22 スマホの幅での bot の状態表示)
- 2026-10-22（独立 bot の大きさ）: `matchMedia` を `useSyncExternalStore` で購読し、64px・160px を切り替える
  - 理由: `BoxBot01` は大きさを px の数値で受け、fov・線幅を計算するため CSS で切り替えられない
  - 不採用: 2 つの独立 bot を CSS で出し分ける（WebGL Canvas が 2 つになる）
  - 再レンダリング: `md` の境界をまたぐ時のみ
- 2026-10-22（確認）: 375・767・768・1280px で全 story の並びを確認した
  - バー: 高さ 90px、`md` の境界をまたぐリサイズにも追従
  - 本 PR の範囲外
    - `Debug`・375px でデバッグ要素の label が横にはみ出す
    - 表示領域（343px）が下の段の幅（311px）より左右 16px ずつ広い（PR #400 の幅の計算）
  - 未対応: standalone-bot のベース hook・`index.types.ts` の構成分割（既存の未準拠）
