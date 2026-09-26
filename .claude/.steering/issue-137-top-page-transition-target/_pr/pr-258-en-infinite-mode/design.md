# proto-03 の EN 無限モード

issue: #137 / PR: #258（backlog「proto-03 の値調整 UI に EN 無限モードを追加する」）

## 目的

- 移動時の EN 消費量を調整可能にする
- 消費量 0 で EN 無限（消費なし）とし、EN を気にせず操作を確認できるようにする

## 背景・制約

- EN 消費は `use-handle-cell-change.ts` の `Energy-consume`（`amount: 1` 固定）の 1 箇所のみ
- EN store・proto-01 と共通の `EnergyDebugPanel` は変更しない
- EN 0 の状態で有効化した場合は 0 のまま（回復させない）

実装計画: [backlog.md](backlog.md)

## 方針

- スライダーは `ControlPanel`（`_contents/control-panel`）の EN 表示の隣へ置く
  - 既存の値調整スライダー群は `Stage07` 内部にある
  - `Stage07` は stage 共通部品のため、find-path 固有の値を持たせない
- 消費量は `_stores/energy-settings`（新設）へ置く
  - `ControlPanel` が書込・表示し、`useHandleCellChange` が読む（content をまたぐため store 化）
  - 命名は既存 `_stores/display-settings` に合わせる
  - `useHandleCellChange` は移動成立時に `getState()` で読むのみ。消費量の変更でステージを再レンダリングしない
- 消費量 0 の場合は `Energy-consume` を dispatch しない
- 範囲 0〜5、既定 1（従来の固定値）
- リセットで既定値へ戻る（他 store と同じく `ResetProvider` 配下で再生成）
