# 実装計画（Stage07 にセルクリック event と moveTo を追加する）

- [ ] `Stage07EventMap` へ `Stage07-cell-click` を追加し、`GeoLayer` のクリックで発行する
  - テスト: クリックで発行される、非対話セルでは発行されない
- [ ] `Stage07Handle` へ `moveTo` を追加する
  - テスト: 隣接・進入可で移動し `true`、それ以外は `false`
