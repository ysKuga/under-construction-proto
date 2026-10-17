# 調整スライダーの設定アイコンのポップオーバー化

PR: #375（親: #357）

## 目的

調整スライダーを独立 bot 右上の設定アイコンのポップオーバーへまとめる。\
開発用のモーション調整はデバッグパネルへ移す。

## 背景・制約

- 親 backlog の項目「調整スライダーを設定アイコンのポップオーバーへまとめる」
  - [../../backlog.md](../../backlog.md)
- 表示・振分けは決定済み
  - (../../decision-records.md 2026-10-17 調整スライダーの表示)
- 現状: `stage-area/_contents/stage-sliders` がステージ・bot の状態表示の行の下へ5本並ぶ
  - (../../_closed/pr-371-expedition-stage-sliders/design.md)

## 構成案

- ポップオーバー: HTML の Popover API（`popover` 属性・`popoverTarget`）
  - 開閉 state・外側クリック・Esc の処理が不要
  - 閉じても DOM は残るため、tilt の `defaultValue` 運用のままで値を保てる
- 位置合わせ: CSS anchor positioning（`anchor-name`・`position-anchor`・`position-area`）
  - アイコンの下・右端揃えで開く
- 置き場
  - `stage-area/_contents/stage-settings`: 設定アイコン + ポップオーバー
  - `stage-settings/_components/stage-sliders`: tilt・移動時間（既存 `stage-sliders` を移動）
  - `debug-panel/_components/motion-sliders`: 歩行周期上限・脚振り角・体の上下量
- アイコン: `FacingSyncToggle` と同じ丸ボタン（lucide `Settings`）、`FacingSyncToggle` の右へ並べる

## 懸念・リスク

- anchor positioning 非対応ブラウザではポップオーバーの位置がアイコンからずれる（操作は可能）
