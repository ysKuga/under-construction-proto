# 実装計画（expedition のレイアウト分割）

- [ ] 状態表示 content（`_contents/status-panel`）を新設する
- [ ] デバッグ要素（`_contents/debug-panel`）を新設する
  - 表示設定・リセット・seed・`EnergySliders`
  - `<details>` で開閉する
- [ ] `ControlPanel` を削除し、`_contents/index.tsx` を状態表示へ切り替える
- [ ] `Stage07` の `extraSliders` から `EnergySliders` を外す
- [ ] `Debug` story を追加する
