# expedition のレイアウト分割（基本構成・デバッグ要素）

PR: #369（親: #357）

## 目的

expedition のレイアウトを基本構成とデバッグ要素へ分け、本実装からデバッグ要素を外す。

## 背景・制約

- 親 backlog の項目「レイアウトを基本構成とデバッグ要素へ分ける」
  - [../../backlog.md](../../backlog.md)
- デバッグ要素とする対象は決定済み
  - (../../decision-records.md 2026-10-17 デバッグ要素)
- 本実装（`index.tsx`）にはデバッグ要素を表示しない
  - (../../decision-records.md 2026-10-17 デバッグ表示)
- hex-stage 組込みの調整スライダー群は対象外（別 PR）
  - (../../decision-records.md 2026-10-17 進め方)

## 構成案

- デバッグ要素: `_contents/debug-panel/`
  - 表示設定（初期表示・到達済みマス表示・歩行モーション・移動可能マス表示）
  - リセット
  - seed・生成・再生成
  - `EnergySliders`（`_contents/debug-panel/_components/energy-sliders/` へ移す）
  - 開閉: `<details>`/`<summary>` でアコーディオン状にする
  - `_contents/index.tsx` からは並べない
- `ControlPanel` の状態表示（`WaypointSelectingIndicator`・中継点数・ゴール到達表示）は削除する
  - (decision-records.md 2026-10-17 状態表示)
- `Title` は削除する
  - (decision-records.md 2026-10-17 タイトル)
- `ControlPanel` は削除する
  - 「状態表示の向きを同期」は移さず削除（`FacingSyncToggle` と重複）
- story: `Debug` story を追加し、`render` で Providers の内側へ基本構成とデバッグ要素を並べる

## 懸念・リスク

- `EnergySliders` は `extraSliders` 経由でなくなるため、EN 操作で `Stage07` が再レンダリングしないことを維持する
