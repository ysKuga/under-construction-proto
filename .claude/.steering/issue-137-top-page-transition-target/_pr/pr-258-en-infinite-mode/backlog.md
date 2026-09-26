# 実装計画（proto-03 の EN 無限モード）

- [ ] `_stores/energy-settings` を新設する（`consumePerMove`・setter）
- [ ] `useHandleCellChange` で消費量を store から読み、0 なら消費しない
- [ ] `ControlPanel` へ消費量スライダーを追加する
- [ ] 実ブラウザで確認する
  - 0 で移動しても EN が減らない
  - EN 0 の状態で 0 にしても EN は 0 のまま
